import { parse } from '@creditkarma/thrift-parser';
import { buildDoc } from './buildDoc'

import { IDocument, isDocument } from './types';

export { parse } from '@creditkarma/thrift-parser'
export { buildDoc } from './buildDoc'
export { transform as markdown  } from './templates/markdown/markdown'
export { transformIndex as markdownIndex  } from './templates/markdown/index'

export type Reader = (path: string) => Promise<string>
export type DocumentLoader = (reader: Reader, path: string) => Promise<IDocument>
export type DependencyLoader = (reader: Reader, doc: IDocument) => Array<Promise<IDocument>>

export const documentLoader: DocumentLoader = async (reader, path) => {
    const content = await reader(path)
    const doc = parse(content)
    if (isDocument(doc)) {
        return buildDoc(path, doc)
    } else {
        throw doc
    }
}

export const getDependencyLoader: DependencyLoader = (reader, doc) =>
    doc.module.includes.map((_) => documentLoader(reader, _))
