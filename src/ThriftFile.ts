import {
    parse,
    SyntaxType,
    ThriftDocument,
    ThriftErrors,
} from '@creditkarma/thrift-parser'

import { ITextFile, Reader } from './TextFile';

export interface IThriftFile {
    textFile: ITextFile
    doc: ThriftDocument
}

export type FileLoader = (pathName: string) => Promise<IThriftFile>

export const fileLoader = (reader: Reader): FileLoader => async (fileName) => {
    const textFile = await reader(fileName)
    const doc = parse(textFile.content)
    if (isDocument(doc)) {
        return { doc, textFile }
    } else {
        throw doc
    }
}

const isDocument = (_: ThriftDocument | ThriftErrors): _ is ThriftDocument => {
    return _.type === SyntaxType.ThriftDocument
}
