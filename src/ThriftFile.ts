import {
    parse as fileParser,
    ParsedPath,
} from 'path'

import {
    parse,
    SyntaxType,
    ThriftDocument,
    ThriftErrors,
} from '@creditkarma/thrift-parser'

export interface IThriftFile {
    file: ParsedPath,
    doc: ThriftDocument
}

export type Reader = (path: string) => Promise<string>
export type FileLoader = (pathName: string) => Promise<IThriftFile>

export const fileLoader = (reader: Reader): FileLoader => async (fileName) => {
    const content = await reader(fileName)
    const doc = parse(content)
    const file = fileBuilder(fileName)
    if (isDocument(doc)) {
        return { doc, file }
    } else {
        throw doc
    }
}

const fileBuilder = (fileName: string) => fileParser(fileName)

const isDocument = (_: ThriftDocument | ThriftErrors): _ is ThriftDocument => {
    return _.type === SyntaxType.ThriftDocument
}
