import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'

import { buildDoc } from '../buildDoc'

import { transform  } from '../templates/markdown'

import {
    parse,
} from '../index'

import {
    ThriftDocument,
    ThriftErrors,
} from '@creditkarma/thrift-parser';

const args = process.argv.slice(2)
const fileName = args[0]
const outputFile = `./${path.parse(fileName).name}.md`

const log = (_: Console) => ({
    error: (doc: any) => {
        _.error(doc)
        return doc
    },
    log: (doc: any) => {
        _.log(doc, {depth: null})
        return doc
    },
})

const logger = log(console)

const loadFile = (fname: string) =>
    util.promisify(fs.readFile)(fname, { encoding: 'utf-8' })

const writeFile = (fname: string) => (md: string) =>
    util.promisify(fs.writeFile)(fname, md, { encoding: 'utf-8' })

const buildDocOrThrow = (doc: ThriftDocument | ThriftErrors) => {
    if (doc.type === 'ThriftDocument') {
        return buildDoc(fileName, doc)
    } else {
        throw doc
    }
}

loadFile(fileName)
    .then(parse)
    .then(buildDocOrThrow)
    .then(transform)
    .then(writeFile(outputFile))
    .catch(logger.error)
