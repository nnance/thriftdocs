  Thrift module: doctest

Thrift module: doctest
======================

Program doctext.

Seriously, this is the documentation for this whole program.

  
## Overview

### Module: doctest

#### Service: [ThriftTest](#Svc_ThriftTest)  

*   [testByte](#Fn_ThriftTest_testByte)
*   [testDouble](#Fn_ThriftTest_testDouble)
*   [testEnum](#Fn_ThriftTest_testEnum)
*   [testI32](#Fn_ThriftTest_testI32)
*   [testI64](#Fn_ThriftTest_testI64)
*   [testInsanity](#Fn_ThriftTest_testInsanity)
*   [testList](#Fn_ThriftTest_testList)
*   [testMap](#Fn_ThriftTest_testMap)
*   [testMapMap](#Fn_ThriftTest_testMapMap)
*   [testNest](#Fn_ThriftTest_testNest)
*   [testSet](#Fn_ThriftTest_testSet)
*   [testString](#Fn_ThriftTest_testString)
*   [testStruct](#Fn_ThriftTest_testStruct)
*   [testTypedef](#Fn_ThriftTest_testTypedef)
*   [testVoid](#Fn_ThriftTest_testVoid)

#### Data types

[BigDog](#Typedef_BigDog)  
[CodeInComment](#Typedef_CodeInComment)  
[EmptyStruct](#Struct_EmptyStruct)  
[FirstAndLastLine](#Typedef_FirstAndLastLine)  
[FirstLineIndent](#Typedef_FirstLineIndent)  
[Flush](#Typedef_Flush)  
[IndentedDocstring](#Typedef_IndentedDocstring)  
[IndentedTitle](#Typedef_IndentedTitle)  
[Insanity](#Struct_Insanity)  
[Irregular1](#Typedef_Irregular1)  
[Irregular2](#Typedef_Irregular2)  
[LastLine](#Typedef_LastLine)  
[NoStars](#Typedef_NoStars)  
[Numberz](#Enum_Numberz)  
[OneField](#Struct_OneField)  
[SorryNoGo](#Typedef_SorryNoGo)  
[StandardMultiLine](#Typedef_StandardMultiLine)  
[TestFor3501a](#Typedef_TestFor3501a)  
[TestFor3501b](#Typedef_TestFor3501b)  
[TestFor3709](#Struct_TestFor3709)  
[TestFor3709\_00](#Struct_TestFor3709_00)  
[TestFor3709\_01](#Struct_TestFor3709_01)  
[TestFor3709\_02](#Struct_TestFor3709_02)  
[TestFor3709\_03](#Struct_TestFor3709_03)  
[TestFor3709\_04](#Struct_TestFor3709_04)  
[TestFor3709\_05](#Struct_TestFor3709_05)  
[TestFor3709\_06](#Struct_TestFor3709_06)  
[TestFor3709\_07](#Struct_TestFor3709_07)  
[TestFor3709\_08](#Struct_TestFor3709_08)  
[TotallyDegenerate](#Typedef_TotallyDegenerate)  
[TrailingWhitespace](#Typedef_TrailingWhitespace)  
[TrivialMultiLine](#Typedef_TrivialMultiLine)  
[UserId](#Typedef_UserId)  
[Xception](#Struct_Xception)  
[Xception2](#Struct_Xception2)  
[Xtruct](#Struct_Xtruct)  
[Xtruct2](#Struct_Xtruct2)  

#### Constants

[INT16CONSTANT](#Const_INT16CONSTANT)  
[INT32CONSTANT](#Const_INT32CONSTANT)  
[MAPCONSTANT](#Const_MAPCONSTANT)

* * *

Constants
---------

Constant

Type

Value

`INT32CONSTANT`

`i32`

`9853`

> You can document constants now too.  Yeehaw!
> 
>   

`INT16CONSTANT`

`i16`

`1616`

`MAPCONSTANT`

``map<`string`, `string`>``

`{ "hello" = "world", "goodnight" = "moon" }`

> Everyone get in on the docu-action!
> 
>   

* * *

Enumerations
------------

### Enumeration: Numberz

Some doc text goes here.  Wow I am \[nesting these\] (no more nesting.)

  
  

`ONE`

`1`

This is how to document a parameter

  

`TWO`

`2`

And this is a doc for a parameter that has no specific value assigned

  

`THREE`

`3`

`FIVE`

`5`

`SIX`

`6`

`EIGHT`

`8`

* * *

Type declarations
-----------------

### Typedef: UserId

**Base type:** `i64`

This is how you would do a typedef doc

  

### Typedef: SorryNoGo

**Base type:** `i32`

### Typedef: TrivialMultiLine

**Base type:** `i32`

This is a trivial example of a multiline docstring.

  

### Typedef: StandardMultiLine

**Base type:** `i32`

This is the canonical example
of a multiline docstring.

  

### Typedef: LastLine

**Base type:** `i32`

The last line is non-blank.
I said non-blank!

  

### Typedef: FirstAndLastLine

**Base type:** `i32`

Both the first line
are non blank. ;-)
and the last line

  

### Typedef: IndentedTitle

**Base type:** `i32`

   INDENTED TITLE
The text is less indented.

  

### Typedef: FirstLineIndent

**Base type:** `i32`

First line indented.
Unfortunately, this does not get indented.

  

### Typedef: CodeInComment

**Base type:** `i32`

void code\_in\_comment() {
  printf("hooray code!");
}

  

### Typedef: IndentedDocstring

**Base type:** `i32`

Indented Docstring.
This whole docstring is indented.
  This line is indented further.

  

### Typedef: Irregular1

**Base type:** `i32`

Irregular docstring.
\* We will have to punt
 \* on this thing

  

### Typedef: Irregular2

**Base type:** `i32`

 \* note the space
 \* before these lines
\* but not this
 \* one

  

### Typedef: Flush

**Base type:** `i32`

Flush against
the left.

  

### Typedef: NoStars

**Base type:** `i32`

No stars in this one.
It should still work fine, though.
  Including indenting.

  

### Typedef: TrailingWhitespace

**Base type:** `i32`

Trailing whitespace
Sloppy trailing whitespace
is truncated.

  

### Typedef: BigDog

**Base type:** `i32`

This is a big one.

We'll have some blank lines in it.

void as\_well\_as(some code) {
  puts("YEEHAW!");
}

  

### Typedef: TotallyDegenerate

**Base type:** `i32`

  

### Typedef: TestFor3501a

**Base type:** `i32`

no room for newline here

  

### Typedef: TestFor3501b

**Base type:** `i32`

/

  

* * *

Data structures
---------------

### Struct: Xtruct

Key

Field

Type

Description

Requiredness

Default value

1

string\_thing

`string`

And the members of a struct

default

4

byte\_thing

`i8`

doct text goes before a comma

default

9

i32\_thing

`i32`

default

11

i64\_thing

`i64`

default

  

And this is where you would document a struct

  

### Struct: Xtruct2

Key

Field

Type

Description

Requiredness

Default value

1

byte\_thing

`i8`

default

2

struct\_thing

`[Xtruct](#Struct_Xtruct)`

default

3

i32\_thing

`i32`

default

  

### Struct: Insanity

Key

Field

Type

Description

Requiredness

Default value

1

userMap

``map<`[Numberz](#Enum_Numberz)`, `[UserId](#Struct_UserId)`>``

This is doc for field 1

default

2

xtructs

``list<`[Xtruct](#Struct_Xtruct)`>``

And this is doc for field 2

default

  

Struct insanity

  

### Exception: Xception

Key

Field

Type

Description

Requiredness

Default value

1

errorCode

`i32`

default

2

message

`string`

default

  

### Exception: Xception2

Key

Field

Type

Description

Requiredness

Default value

1

errorCode

`i32`

default

2

struct\_thing

`[Xtruct](#Struct_Xtruct)`

default

  

### Struct: EmptyStruct

Key

Field

Type

Description

Requiredness

Default value

  

Doc

  

### Struct: OneField

Key

Field

Type

Description

Requiredness

Default value

1

field

`[EmptyStruct](#Struct_EmptyStruct)`

default

  

### Struct: TestFor3709\_00

Key

Field

Type

Description

Requiredness

Default value

1

foo

`i32`

default

  

### Struct: TestFor3709\_01

Key

Field

Type

Description

Requiredness

Default value

1

foo

`i32`

default

  

### Struct: TestFor3709\_02

Key

Field

Type

Description

Requiredness

Default value

1

foo

`i32`

default

  

### Struct: TestFor3709\_03

Key

Field

Type

Description

Requiredness

Default value

1

foo

`i32`

default

  

Comment-end tokens can of course have more than one asterisk

  

### Struct: TestFor3709\_04

Key

Field

Type

Description

Requiredness

Default value

1

foo

`i32`

default

  

Comment-end tokens can of course have more than one asterisk \*

  

### Struct: TestFor3709\_05

Key

Field

Type

Description

Requiredness

Default value

1

foo

`i32`

default

  

Comment-end tokens can of course have more than one asterisk \*\*

  

### Struct: TestFor3709\_06

Key

Field

Type

Description

Requiredness

Default value

1

foo

`i32`

default

  

\* Comment-end tokens can of course have more than one asterisk

  

### Struct: TestFor3709\_07

Key

Field

Type

Description

Requiredness

Default value

1

foo

`i32`

default

  

\* Comment-end tokens can of course have more than one asterisk \*

  

### Struct: TestFor3709\_08

Key

Field

Type

Description

Requiredness

Default value

1

foo

`i32`

default

  

\* Comment-end tokens can of course have more than one asterisk \*\*

  

### Struct: TestFor3709

Key

Field

Type

Description

Requiredness

Default value

1

id

`string`

This is a comment

required

2

typeId

`string`

This is also a comment \*

required

3

endTimestamp

`i32`

Yet another comment!

required

  

* * *

Services
--------

### Service: ThriftTest

This is where you would document a Service

  

#### Function: ThriftTest.testVoid

    void

And this is how you would document functions in a service

  

#### Function: ThriftTest.testString

    string

#### Function: ThriftTest.testByte

    i8

#### Function: ThriftTest.testI32

    i32

#### Function: ThriftTest.testI64

    i64

Like this one

  

#### Function: ThriftTest.testDouble

    double

#### Function: ThriftTest.testStruct

    Xtruct

#### Function: ThriftTest.testNest

    Xtruct2

#### Function: ThriftTest.testMap

    map<i32, i32>

#### Function: ThriftTest.testSet

    set<i32>

#### Function: ThriftTest.testList

    list<i32>

#### Function: ThriftTest.testEnum

    Numberz

This is an example of a function with params documented

  
  

#### Parameters

Name

Description

thing

This param is a thing

#### Function: ThriftTest.testTypedef

    UserId

#### Function: ThriftTest.testMapMap

    map<i32, map<i32, i32>>

#### Function: ThriftTest.testInsanity

    map<UserId, map<Numberz, Insanity>>