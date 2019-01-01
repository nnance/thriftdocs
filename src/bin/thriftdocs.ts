import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'

import { buildDoc } from '../buildDoc'
import { parse } from '../index'
import { log } from '../lib/logger'
import { transform  } from '../templates/markdown/markdown'

import {
    ThriftDocument,
    ThriftErrors,
} from '@creditkarma/thrift-parser';

const args = process.argv.slice(2)
const fileName = args[0]
const outputDir = args[1] || './'
const outputFile = fileName ? `${outputDir}${path.parse(fileName).name}.md` : undefined

const loadFile = (fname: string) => util.promisify(fs.readFile)(fname, { encoding: 'utf-8' })
const writeFile = (fname: string) => (md: string) => util.promisify(fs.writeFile)(fname, md, { encoding: 'utf-8' })

const buildDocOrThrow = (doc: ThriftDocument | ThriftErrors) => {
    if (doc.type === 'ThriftDocument') {
        return buildDoc(fileName, doc)
    } else {
        throw doc
    }
}

const logger = log(console)

if (outputFile) {
    loadFile(fileName)
        .then(parse)
        .then(buildDocOrThrow)
        .then(transform)
        .then(writeFile(outputFile))
        .catch(logger.error)
} else {
    logger.log('\n  Usage: thriftdocs file [outdir]\n')
    process.exit(1)
}
