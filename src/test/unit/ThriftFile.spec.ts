import { expect } from 'chai'
import {
    describe,
    it,
} from 'mocha'

import {
    content,
} from './content.spec'

import {
    fileLoader,
    IThriftFile,
} from '../../ThriftFile'

const contentPath = 'index.thrift';

const loader = fileLoader(async (fileName: string) => content)

describe('when loading a ThriftFile', () => {
    let doc: IThriftFile

    before(async () => {
        doc = await loader(contentPath)
    })

    it('should call the reader with the file path', () => {
        expect(doc.file.name).to.deep.equal('index')
    })
    it('should provide a ThriftFile with one service', () => {
        expect(doc.doc.body.length).to.equal(2)
    })
})
