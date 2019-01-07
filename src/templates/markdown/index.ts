import {
    Generator,
    IDocument,
    IService,
    ISourceOutput,
} from '../../types'

import { transform as markdown } from './markdown'

import * as path from 'path'

const methods = (_: IService) => _.methods.map((m) => m.name).join('<br>')
const types = (_: IDocument) => _.module.dataTypes.map((t) => t.name).join('<br>')
const consts = (_: IDocument) => _.constants.map((c) => c.name).join('<br>')

const moduleRef = (outPath: string, _: ISourceOutput) =>
    `[${_.doc.module.name}](${path.relative(outPath, _.output)})`

const serviceRef = (outPath: string, source: ISourceOutput, s: IService) =>
    `[${s.name}](${path.relative(outPath, source.output)}#${s.name})`

const excludeIndex = (_: ISourceOutput) => _.output.indexOf('index.md') === -1

export const transform: Generator = (output = './', sources = []) => (doc) => `
# All Thrift Declarations

Module | Services | Methods | Data types | Constants
--- | --- | --- | --- | ---
${sources.filter(excludeIndex).map((_) => _.doc.services.map((s) =>
    [moduleRef(output, _), serviceRef(output, _, s), methods(s), types(_.doc), consts(_.doc)].join(' | '))).join('\n')}
`
