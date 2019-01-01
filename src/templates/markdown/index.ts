import {
    IDocField,
    IDocument,
    IService,
} from '../../types'

import { transform as markdown } from './markdown'

const methods = (_: IService) => _.methods.map((m) => m.name).join('<br>')
const types = (_: IDocument) => _.module.dataTypes.map((t) => t.name).join('<br>')
const consts = (_: IDocument) => _.constants.map((c) => c.name).join('<br>')

export const transform = (_: IDocument) => [
    {
        content: transformIndex(_),
        name: 'index.md',
    }, {
        content: markdown(_),
        name: _.module.name,
    },
]

export const transformIndex = (_: IDocument) => `
# All Thrift Declarations

Module | Services | Methods | Data types | Constants
--- | --- | --- | --- | ---
${_.services.map((s) =>
    [_.module.name, s.name, methods(s), types(_), consts(_)].join(' | ')).join('\n')}
`
