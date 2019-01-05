import { expect } from 'chai'
import {
    describe,
    it,
} from 'mocha'

import { curry } from 'lodash/fp'

import {
    documentLoader,
    getDependencyLoader,
} from '../../index'
import { IDocument } from '../../types';

const content = `
    include "shared.thrift"

    struct SharedStruct {
        1: i32 key
        2: string value
    }

    service SharedService {
        SharedStruct getStruct(1: i32 key)
    }
`
let readerPath: string
const reader = async (path: string) => {
    readerPath = path
    return content
}
const contentPath = './index.md';
const loader = curry(documentLoader)(reader)

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

    before(async () => {
        const doc = await loader(contentPath)
        deps = await Promise.all(getDependencyLoader(reader, doc))
    })

    it('should provide a IDocument with one data structure', () => {
        expect(deps.length).to.equal(1)
    })
})
