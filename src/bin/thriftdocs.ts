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
    ISourceOutput,
} from '../types';

const args = process.argv.slice(2)
const fileName = path.resolve('.', args[0])
const outputDir = args[1] || './'
// const outputFile = fileName ? `${outputDir}${path.parse(fileName).name}.md` : undefined

const loadFile = (fname: string) => util.promisify(fs.readFile)(fname, { encoding: 'utf-8' })

const logger = log(console)

const logResults = (results: Array<Promise<boolean>>) =>
    logger.log(`Generated ${results.length} documents to ${outputDir}`)

const buildSourceOutputs = (sourceFile: string) => (includes: IDocument[]): ISourceOutput[] => {
    return includes.map((_) => {
        const file = _.module.fileName
        const getOutputName = (name: string) => {
            const parsedPath = path.parse(name)
            return path.resolve(outputDir, '.') + '/' + parsedPath.name + '.md'
        }

        const outputFiles: ISourceOutput[] = []
        if (file === sourceFile) {
            outputFiles.push({
                doc: _,
                generator: markdownIndex,
                output: getOutputName('index'),
            })
        }
        outputFiles.push({
            doc: _,
            generator: markdown,
            output: getOutputName(file),
        })
        return outputFiles
    }).reduce((p, c) => p.concat(c), [])
}

const outputFile = (file: string) => (md: string) =>
    util.promisify(fs.writeFile)(file, md, { encoding: 'utf-8' }).then(() => true)

const loader = documentLoader(loadFile)

const generateDocs = async (includes: ISourceOutput[]) => includes.map((file) => {
    const md = file.generator(outputDir, includes)(file.doc)
    return outputFile(file.output)(md)
})

const loadDependencies = (doc: IDocument) =>
    Promise
        .all(getDependencyLoader(loader)(doc))
        .then((_) => _.concat(doc))

if (outputFile) {
    loader(fileName)
        .then(loadDependencies)
        .then(buildSourceOutputs(fileName))
        .then(generateDocs)
        .then(logResults)
        .catch(logger.error)
} else {
    logger.log('\n  Usage: thriftdocs file [outdir]\n')
    process.exit(1)
}
