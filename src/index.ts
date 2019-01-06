import { parse } from '@creditkarma/thrift-parser';
import * as path from 'path'
import { buildDoc } from './buildDoc'

import { IDocument, isDocument } from './types';
export { transform as markdown  } from './templates/markdown/markdown'
export { transformIndex as markdownIndex  } from './templates/markdown/index'

export type Reader = (path: string) => Promise<string>
export type DocumentLoader = (pathName: string) => Promise<IDocument>

export const documentLoader = (reader: Reader): DocumentLoader => async (pathName) => {
    const content = await reader(pathName)
    const doc = parse(content)
    if (isDocument(doc)) {
        return buildDoc(pathName, doc)
    } else {
        throw doc
    }
}

export const getDependencyLoader = (loader: DocumentLoader) => (doc: IDocument) =>
    doc.module.includes.map((_) => {
        const fullPath = path.resolve(path.parse(doc.module.fileName).dir, _)
        return loader(fullPath)
    })
