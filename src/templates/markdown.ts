import {
    IDocField,
    IDocument,
    IMethod,
    IService,
} from '../index'

const fieldList = (_: IDocField[]) => _.map((p) => p.type + ' ' + p.name).join(', ')

const methods = (_: IService) => _.methods.map((m) => m.name).join('<br>')
const types = (_: IDocument) => _.dataTypes.map((t) => t.name).join('<br>')
const consts = (_: IDocument) => _.constants.map((c) => c.name).join('<br>')
const params = (m: IMethod) => fieldList(m.params)
const throws = (m: IMethod) => m.throws.length ? ' throws ' + fieldList(m.throws) : ''

const blockComments = (d: string[] | undefined) => d ? d.map((s) => `> ${s}\n`).join('') : ''
const colComments = (d: string[] | undefined) => d ? d.join('<br>') : ''

export const transform = (_: IDocument) => `
# Thrift module: ${_.module.name}

${_.module.comments ? `\`\`\`
${_.module.comments.join('\n')}
\`\`\`` : ''}

Module | Services | Methods | Data types | Constants |
--- | --- | --- | --- | --- |
${_.services.map((s) => `${_.module.name} | ${s.name} | ${methods(s)} | ${types(_)} | ${consts(_)} |`).join('\n')}

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
    `${f.index} | ${f.name} | ${f.type} | ${colComments(f.comments)} | ${f.required} | ${f.default}`).join('\n')}

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
    `${d.name} | ${d.type} | ${d.value} | ${colComments(d.comments)}`).join('\n')}

## Enumerations

${_.enums.map((d) => `### ${d.name}

Name | Value
--- | ---
${d.members.map((f) =>
    `${f.name} | ${f.value}`).join('\n')}

${blockComments(d.comments)}
`).join('')
}
`
