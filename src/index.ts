import { parse } from '@creditkarma/thrift-parser';
import * as path from 'path'
import { buildDoc } from './buildDoc'

import { IDocument, isDocument } from './types';

import {
    flatten,
} from 'lodash/fp';

export { transform as markdown  } from './templates/markdown/markdown'
export { transform as markdownIndex  } from './templates/markdown/index'

export type Reader = (path: string) => Promise<string>
export type DocumentLoader = (pathName: string) => Promise<IDocument>
export type DependencyLoader = (doc: IDocument) => Array<Promise<IDocument>>

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

const sameModule = (x: IDocument) => (y: IDocument) => x.module.name === y.module.name
const existingModule = (prev: IDocument[]) => (_: IDocument) => prev.find(sameModule(_)) ? false : true

export const loadAllDependents = (depLoader: DependencyLoader, source: IDocument): Promise<IDocument[]> => {
    const loadIterator = (prev: IDocument[]) => async (doc: IDocument): Promise<IDocument[]> => {
        // load all the dependent documents
        const deps = await Promise.all(depLoader(doc))

        // filter out any previously loaded docs
        const filteredDoc = deps.filter((_) => !sameModule(doc)(_))
        const filteredDeps = filteredDoc.filter(existingModule(prev))

        // load dependents for any docs we haven't previously processed
        if (filteredDeps.length) {
            const loadedDeps = prev.concat(doc, filteredDeps)
            const nextDeps = await Promise.all(deps.map(loadIterator(loadedDeps)))
            return flatten(nextDeps.concat(deps))
        } else {
            return filteredDeps
        }
    }
    return loadIterator([])(source)
}
