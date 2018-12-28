import {
    IDocument,
    IMethod,
    IService,
} from '../index'

const methods = (_: IService) => _.methods.map((m) => m.name).join('<br>')
const types = (_: IDocument) => _.dataTypes.map((t) => t.name).join('<br>')
const consts = (_: IDocument) => _.constants.map((c) => c.name).join('<br>')
const params = (m: IMethod) => m.params.map((p) => p.type + ' ' + p.name).join(', ')
const throws = (m: IMethod) => m.throws.length ? ' throws ' + m.throws.map((t) => t.type + ' ' + t.name).join(', ') : ''

export const transform = (_: IDocument) => `
# Thrift module: ${_.module.name}

${_.module.comments ? `\`\`\`
${_.module.comments.join('\n')}
\`\`\`` : ''}

Module | Services | Methods | Data types | Constants |
--- | --- | --- | --- | --- |
${_.services.map((s) => `${_.module.name} | ${s.name} | ${methods(s)} | ${types(_)} | ${consts(_)} |`).join('')}

## Services

${_.services.map((s) => `### ${s.name}

${s.methods.map((m) => `#### Function: ${m.name}

> ${m.return} ${m.name}(${params(m)})${throws(m)}

`).join('')
}`).join('')
}## Data Structures

### Struct: Work

 Key | Field | Type | Description | Required | Default value |
 --- | --- | --- | --- | --- | --- |
 1 | num1 | i32 |  |  | 0 |
 2 | num2 | i32 |  |  |  |
 3 | op | [Operation](#Operation) |  |  |  |
 4 | comment | string |  | optional |  |

### Exception: InvalidOperation
Key	Field | Type |Description | Requiredness | Default value
1 | whatOp | i32 | default
2 | why | string | default

> Structs can also be exceptions, if they are nasty.

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
`}
