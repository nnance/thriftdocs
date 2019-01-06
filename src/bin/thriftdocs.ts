import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'

import {
    documentLoader,
    getDependencyLoader,
    markdown,
    markdownIndex,
} from '../index'

import { log } from '../lib/logger'

import {
    IDocument,
} from '../types';

const args = process.argv.slice(2)
const fileName = path.resolve('.', args[0])
const outputDir = args[1] || './'
// const outputFile = fileName ? `${outputDir}${path.parse(fileName).name}.md` : undefined

const loadFile = (fname: string) => util.promisify(fs.readFile)(fname, { encoding: 'utf-8' })

interface ISourceOutput {
    source: string
    output: string
    generator: (_: IDocument) => string
}

const logger = log(console)

const logResults = (results: Array<Promise<boolean>>) =>
    logger.log(`Generated ${results.length} documents to ${outputDir}`)

const buildSourceOutputs = (sourceFile: string) => (includes: string[]): ISourceOutput[] => {
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

const outputFile = (file: string) => (md: string) =>
    util.promisify(fs.writeFile)(file, md, { encoding: 'utf-8' }).then(() => true)

const loader = documentLoader(loadFile)

const generateDocs = (sourceFile: string) => (includes: ISourceOutput[]) => includes.map((file) =>
    loader(file.source)
        .then(file.generator)
        .then(outputFile(file.output)))

const loadDependencies = getDependencyLoader(loader)

if (outputFile) {
    loader(fileName)
        .then(loadDependencies)
        .then((_) => Promise.all(_))
        .then((_) => _.forEach((m) => logger.log(m.module.fileName)))
        // // .then(buildSourceOutputs(fileName))
        // // .then(generateDocs(fileName))
        // .then(logResults)
        .catch(logger.error)
} else {
    logger.log('\n  Usage: thriftdocs file [outdir]\n')
    process.exit(1)
}
