import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'

import {
    buildDoc,
    markdown,
    markdownIndex,
    parse,
} from '../index'

import { log } from '../lib/logger'

import {
    ThriftDocument,
    ThriftErrors,
} from '@creditkarma/thrift-parser';

import {
    IDocument,
    isDocument,
    isInclude,
} from '../types';

const args = process.argv.slice(2)
const fileName = path.resolve('.', args[0])
const outputDir = args[1] || './'
// const outputFile = fileName ? `${outputDir}${path.parse(fileName).name}.md` : undefined

const loadFile = (fname: string) => util.promisify(fs.readFile)(fname, { encoding: 'utf-8' })

const isDocumentOrThrow = (doc: ThriftDocument | ThriftErrors) => {
    if (isDocument(doc)) {
        return doc
    } else {
        throw doc
    }
}

interface ISourceOutput {
    source: string
    output: string
    generator: (_: IDocument) => string
}

const getIncludes = (file: string) => (doc: ThriftDocument): string[] =>
    doc.body.filter(isInclude).map((_) => path.resolve(path.parse(file).dir, _.path.value)).concat([file])

const logger = log(console)

const logResults = (results: Array<Promise<boolean>>) =>
    logger.log(`Generated ${results.length} documents to ${outputDir}`)

const transformToOutput = (sourceFile: string) => (includes: string[]): ISourceOutput[] => {
    return includes.map((file) => {
        const getOutputName = (name: string) => {
            const parsedPath = path.parse(name)
            return path.resolve(outputDir, '.') + '/' + parsedPath.name + '.md'
        }

        const outputFiles = []
        if (file === sourceFile) {
            outputFiles.push({
                generator: markdownIndex,
                output: getOutputName('index'),
                source: file,
            })
        }
        outputFiles.push({
            generator: markdown,
            output: getOutputName(file),
            source: file,
        })
        return outputFiles
    }).reduce((p, c) => p.concat(c), [])
}

const outputFile = (file: string) => (md: string) => {
    const parsedPath = path.parse(file)
    const fullPath = path.resolve(outputDir, '.') + '/' + parsedPath.name + '.md'
    return util.promisify(fs.writeFile)(fullPath, md, { encoding: 'utf-8' }).then(() => true)
}

const generateDocs = (sourceFile: string) => (includes: ISourceOutput[]) => includes.map((file) =>
    loadFile(file.source)
        .then(parse)
        .then(isDocumentOrThrow)
        .then((_) => buildDoc(file.source, _))
        .then(file.generator)
        .then(outputFile(file.output)))

if (outputFile) {
    loadFile(fileName)
        .then(parse)
        .then(isDocumentOrThrow)
        .then(getIncludes(fileName))
        .then(transformToOutput(fileName))
        .then(generateDocs(fileName))
        .then(logResults)
        .catch(logger.error)
} else {
    logger.log('\n  Usage: thriftdocs file [outdir]\n')
    process.exit(1)
}
