import {
    moduleName,
} from '../index'

import { ThriftDocument } from '@creditkarma/thrift-parser'

export const transform = (fileName: string, ast: ThriftDocument) => `# Thrift module: ${moduleName(fileName)}

\`\`\`
The first thing to know about are types. The available types in Thrift are:

 bool        Boolean, one byte
 i8 (byte)   Signed 8-bit integer
 i16         Signed 16-bit integer
 i32         Signed 32-bit integer
 i64         Signed 64-bit integer
 double      64-bit floating point value
 string      String
 binary      Blob (byte array)
 map<t1,t2>  Map from one type to another
 list<t1>    Ordered list of one type
 set<t1>     Set of unique elements of one type

 Did you also notice that Thrift supports C style comments?
\`\`\`

 Module | Services | Methods | Data types | Constants |
 --- | --- | --- | --- | --- |
 tutorial | Calculator | add<br>calculate<br>ping<br>zip | InvalidOperation<br>MyInteger<br>Operation<br>Work | INT32CONSTANT<br>MAPCONSTANT |

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
