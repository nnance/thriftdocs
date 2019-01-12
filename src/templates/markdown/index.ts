import {
    Generator,
    ISourceOutput,
} from '../../types'

import {
    consts,
    methods,
    moduleRef,
    serviceRef,
    types,
} from './lib';

const excludeIndex = (_: ISourceOutput) => _.output.indexOf('index.md') === -1

export const transform: Generator = (out = './', sources = []) => (doc) => `
# All Thrift Declarations

Module | Services | Methods | Data types | Constants
--- | --- | --- | --- | ---
${sources.filter(excludeIndex).map((_) => _.doc.services.map((s) =>
    [moduleRef(out, _), serviceRef(out, _, s), methods(s), types(_.doc), consts(_.doc)].join(' | '))).join('\n')}
`
