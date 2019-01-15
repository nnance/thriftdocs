import { expect } from 'chai'
import { describe, it } from 'mocha'

import * as path from 'path'

import {
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

import { fileLoader } from '../../ThriftFile';
import { graphLoader, IThriftGraph } from '../../ThriftGraph';

const contentPath = 'index.thrift';

let callCount = 0
const getContent = (fileName: string) => {
    callCount = callCount + 1
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
}

const loader = fileLoader(async (pathName: string) => ({
    content: getContent(pathName),
    file: path.parse(pathName),
    pathName,
}))

describe('when loading dependencies', () => {
    let graph: IThriftGraph

    before(async () => {
        callCount = 0
        const thriftFile = await loader(contentPath)
        graph = await graphLoader(loader)(thriftFile)
    })

    it('should provide a IDocument with one data structure', () => {
        expect(graph.dependencies.length).to.equal(1)
    })
    it('should call the loader twice', () => {
        expect(callCount).to.equal(2)
    })
})

describe('when loading all dependencies', () => {
    let graph: IThriftGraph

    const depLoader = graphLoader(loader)

    describe('with a single include', () => {
        before(async () => {
            const doc = await loader(contentPath)
            graph = await depLoader(doc)
        })

        it('should load the dependent documents', () => {
            expect(graph.dependencies.length).to.equal(1)
        })
    })

    describe('with a two levels of dependents', () => {
        before(async () => {
            const doc = await loader('include.thrift')
            graph = await depLoader(doc)
        })

        it('should load the dependent documents', () => {
            expect(graph.dependencies.length).to.equal(2)
        })

        it('should load two dependents for the struct document', () => {
            const isStruct = (_: IThriftGraph) => _.file.textFile.pathName === 'struct.thrift'
            const file = graph.dependencies.find(isStruct) || { dependencies: []}
            expect(file.dependencies.length).to.equal(2)
        })

        it('should load one dependent for the enum document', () => {
            const isEnum = (_: IThriftGraph) => _.file.textFile.pathName === 'enum.thrift'
            const file = graph.dependencies.find(isEnum) || { dependencies: []}
            expect(file.dependencies.length).to.equal(1)
        })
    })
})
