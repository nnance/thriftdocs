export const content = `
include "shared.thrift"

service SharedService {
    shared.SharedStruct getStruct(1: i32 key)
}
`

export const sharedDoc = `
struct SharedStruct {
    1: i32 key
    2: string value
}
`

export const includeSource = `
include "struct.thrift"
include "enum.thrift"

const i32 DIVIDE = 4

service SharedService {
    struct.SharedStruct getStruct(1: i32 key, 2: enum.Operation operation)
}
`

export const includeStruct = `
include "enum.thrift"
include "share.thrift"
`

export const includeEnum = `
include "include.thrift"

enum Operation {
    ADD = 1,
    SUBTRACT = 2,
    MULTIPLY = 3,
    DIVIDE = 4
  }
`
