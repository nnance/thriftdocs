import {
    Generator,
} from '../../types'

import {
    blockComments,
    colComments,
    consts,
    methods,
    params,
    throws,
    types,
} from './lib';

export const transform: Generator = () => (_) => `
# Thrift module: ${_.module.name}

${_.module.comments ? `\`\`\`
${_.module.comments.join('\n')}
\`\`\`` : ''}

Module | Services | Methods | Data types | Constants
--- | --- | --- | --- | ---
${_.services.map((s) =>
    [_.module.name, s.name, methods(s), types(_), consts(_)].join(' | ')).join('\n')}

## Services

${_.services.map((s) => `### ${s.name}

${s.methods.map((m) => `#### Function: ${m.name}

> ${m.return} ${m.name}(${params(m)})${throws(m)}

`).join('')
}`).join('')
}## Data Structures

${_.dataStructs.map((d) => `### ${d.type}: ${d.name}

Key | Field | Type | Description | Required | Default value
--- | --- | --- | --- | --- | ---
${d.fields.map((f) =>
    [f.index, f.name, f.type, colComments(f.comments), f.required, f.default].join(' | ')).join('\n')}

${blockComments(d.comments)}
`).join('')
}## Types

${_.typedDefs.map((d) => `### Typedef: ${d.name} (${d.type})

${blockComments(d.comments)}
`).join('\n')
}## Constants

Constant | Type | Value | Notes
--- | --- | --- | ---
${_.constants.map((d) =>
    [d.name, d.type, d.value, colComments(d.comments)].join(' | ')).join('\n')}

## Enumerations

${_.enums.map((d) => `### ${d.name}

Name | Value
--- | ---
${d.members.map((f) =>
    [f.name, f.value].join(' | ')).join('\n')}

${blockComments(d.comments)}
`).join('')
}
`
