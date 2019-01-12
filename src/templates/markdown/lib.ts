import {
    IDocField,
    IDocument,
    IMethod,
    IService,
    ISourceOutput,
} from '../../types'

import * as path from 'path'

const fieldList = (_: IDocField[]) => _.map((p) => p.type + ' ' + p.name).join(', ')

export const methods = (_: IService) => _.methods.map((m) => m.name).join('<br>')
export const types = (_: IDocument) => _.module.dataTypes.map((t) => t.name).join('<br>')
export const consts = (_: IDocument) => _.constants.map((c) => c.name).join('<br>')

export const moduleRef = (outPath: string, _: ISourceOutput) =>
    `[${_.doc.module.name}](${path.relative(outPath, _.output)})`

export const serviceRef = (outPath: string, source: ISourceOutput, s: IService) =>
    `[${s.name}](${path.relative(outPath, source.output)}#${s.name})`

export const params = (m: IMethod) => fieldList(m.params)
export const throws = (m: IMethod) => m.throws.length ? ' throws ' + fieldList(m.throws) : ''

export const blockComments = (d: string[] | undefined) => d ? d.map((s) => `> ${s}\n`).join('') : ''
export const colComments = (d: string[] | undefined) => d ? d.join('<br>') : ''
