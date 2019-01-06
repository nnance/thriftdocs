import { expect } from 'chai'
import {
    describe,
    it,
} from 'mocha'

import * as path from 'path'

import {
    documentLoader,
    getDependencyLoader,
} from '../../index'
import { IDocument } from '../../types';

const content = `
    include "./shared.thrift"

    struct SharedStruct {
        1: i32 key
        2: string value
    }

    service SharedService {
        SharedStruct getStruct(1: i32 key)
    }
`
let readerPath: string
const reader = async (pathName: string) => {
    readerPath = pathName
    return content
}
const contentPath = 'index.thrift';
const loader = documentLoader(reader)

describe('when loading a document', async () => {
    let doc: IDocument

    before(async () => {
        doc = await loader(contentPath)
    })

    it('should call the reader with the file path', () => {
        expect(readerPath).to.equal(contentPath)
    })
    it('should provide a IDocument with one data structure', () => {
        expect(doc.dataStructs.length).to.equal(1)
    })
})

describe('when loading dependencies', async () => {
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
