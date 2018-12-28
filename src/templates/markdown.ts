import { Helpers } from '../index'

export const transform = (_: Helpers) => `# Thrift module: ${_.module().name}

\`\`\`
${_.module().comments.join('\n')}
\`\`\`

 Module | Services | Methods | Data types | Constants |
 --- | --- | --- | --- | --- |
 ${_.module().name} | Calculator | add<br>calculate<br>ping<br>zip | InvalidOperation<br>MyInteger<br>Operation<br>Work | INT32CONSTANT<br>MAPCONSTANT |

## Services

### Calculator

#### Function: add

> i32 add(i32 num1, i32 num2) 

#### Function: calculate

> i32 calculate(i32 logid, [Work](#Work) w) throws [InvalidOperation](#InvalidOperation) ouch

#### Function: ping

> void ping() 

#### Function: zip

> void zip() 

## Data Structures

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
`
