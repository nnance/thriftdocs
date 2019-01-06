import { expect } from 'chai'
import {
    describe,
    it,
} from 'mocha'

import * as path from 'path'

import {
    documentLoader,
    getDependencyLoader,
    loadAllDependents,
} from '../../index'
import { IDocument } from '../../types';

import {
    content,
    includeEnum,
    includeSource,
    includeStruct,
    sharedDoc,
} from './content.spec'

let readerPath: string
const contentPath = 'index.thrift';

const loader = documentLoader(async (fileName: string) => {
    readerPath = fileName
    if (fileName.indexOf('index') > -1) {
        return content
    } else if (fileName.indexOf('include') > -1) {
        return includeSource
    } else if (fileName.indexOf('struct') > -1) {
        return includeStruct
    } else if (fileName.indexOf('enum') > -1) {
        return includeEnum
    } else {
        return sharedDoc
    }
})

describe('when loading a document', () => {
    let doc: IDocument

    before(async () => {
        doc = await loader(contentPath)
    })

    it('should call the reader with the file path', () => {
        expect(readerPath).to.equal(contentPath)
    })
    it('should provide a IDocument with one service', () => {
        expect(doc.services.length).to.equal(1)
    })
})

describe('when loading dependencies', () => {
    let deps: IDocument[]
    const expectedNames: string[] = []
    const results: string[] = []

    const loaderMock = (pathName: string) => {
        results.push(pathName)
        return loader(pathName)
    }

    before(async () => {
        const doc = await loader(contentPath)
        expectedNames.push(path.resolve(path.parse(doc.module.fileName).dir, './shared.thrift'))
        const depLoader = getDependencyLoader(loaderMock)
        deps = await Promise.all(depLoader(doc))
    })

    it('should provide a IDocument with one data structure', () => {
        expect(deps.length).to.equal(1)
    })
    it('should call the loader 1 time', () => {
        expect(results.length).to.equal(1)
    })
    it('should call the loader the first time with a relative path', () => {
        expect(results).to.deep.equal(expectedNames)
    })
})

describe('when loading all dependencies', () => {
    let docs = []

    describe('with a single include', () => {
        before(async () => {
            const doc = await loader(contentPath)
            docs = await loadAllDependents(getDependencyLoader(loader), doc)
        })

        it('should load the dependent documents', () => {
            expect(docs.length).to.equal(1)
        })
    })

    describe('with a two levels of dependents', () => {
        before(async () => {
            const doc = await loader('include.thrift')
            docs = await loadAllDependents(getDependencyLoader(loader), doc)
        })

        it('should load the dependent documents', () => {
            expect(docs.length).to.equal(2)
        })
    })
})
