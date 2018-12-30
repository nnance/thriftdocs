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
${d.fields.map((f) => `${f.index} | ${f.name} | ${f.type} | ${f.comments} | ${f.required} | ${f.default}`).join('\n')}

${d.comments ? d.comments.map((c) => `> ${c}\n`).join('') : '\n'}
`).join('')}
## Types

### Typedef: MyInteger (i32)

> Thrift lets you do typedefs to get pretty names for your types. Standard C style here.

## Constants

Constant | Type | Value | Notes
--- | --- | --- | ---
INT32CONSTANT | i32 | 9853 | Thrift also lets you define constants for use across languages. Complex types and structs are specified using JSON notation.
MAPCONSTANT | map<string,string> MAPCONSTANT | {'hello':'world', 'goodnight':'moon'}

## Enumerations

### Operation

> You can define enums, which are just 32 bit integers. Values are optional and start at 1 if not supplied, C style again.

Name | Value
--- | ---
ADD | 1
SUBTRACT | 2
MULTIPLY | 3
DIVIDE | 4
`
