import * as path from 'path'

import {
    FileLoader,
    IThriftFile,
} from './ThriftFile'

import { isInclude } from './types';

import { IncludeDefinition } from '@creditkarma/thrift-parser';

export interface IThriftGraph {
    file: IThriftFile
    dependencies: IThriftGraph[]
}

export type GraphLoader = (file: IThriftFile) => Promise<IThriftGraph>

export const graphLoader = (loader: FileLoader): GraphLoader => {
    const loaderIterator = (prev: IThriftGraph[]) => async (file: IThriftFile): Promise<IThriftGraph> => {

        const graph: IThriftGraph = { file, dependencies: [] }

        const paths = file.doc.body
            .filter(isInclude)
            .map(getPath)

        const loaders = paths
            .filter(exists(prev))
            .map(loader)

        const thriftDeps = await Promise.all(loaders)

        const depsLoader = loaderIterator(prev.concat(graph))
        const graphLoaders = thriftDeps.map(depsLoader)

        const dependencies = await Promise.all(graphLoaders)

        const circularDeps = prev
            .filter((_) => paths.find((p) => sameFile(p)(_)) ? true : false)

        graph.dependencies = graph.dependencies.concat(dependencies).concat(circularDeps)

        return graph
    }
    return loaderIterator([])
}

const getPath = (include: IncludeDefinition) => include.path.value
const exists = (prev: IThriftGraph[]) => (_: string) => prev.find(sameFile(_)) ? false : true
const sameFile = (x: string) => (y: IThriftGraph) => y.file.textFile.pathName === x
