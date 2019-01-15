import { expect } from 'chai'
import { describe, it } from 'mocha'

import * as path from 'path'

import {
    content,
} from './content.spec'

import {
    fileLoader,
    IThriftFile,
} from '../../ThriftFile'

const contentPath = 'index.thrift';

const loader = fileLoader(async (pathName: string) => {
    return {
        content,
        file: path.parse(pathName),
        pathName,
    }
})

describe('when loading a ThriftFile', () => {
    let thriftFile: IThriftFile

    before(async () => {
        thriftFile = await loader(contentPath)
    })

    it('should call the reader with the file path', () => {
        expect(thriftFile.textFile.file.name).to.deep.equal('index')
    })
    it('should provide a ThriftFile with one service', () => {
        expect(thriftFile.doc.body.length).to.equal(2)
    })
})
