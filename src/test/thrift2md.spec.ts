import { expect } from 'chai'
import {
    before,
    describe,
    it,
} from 'mocha'

import * as fs from 'fs'
import { resolve } from 'path'

import {
    parse,
    ThriftDocument,
} from '@creditkarma/thrift-parser'

import { buildDoc } from '../buildDoc'

import { transform  } from '../templates/markdown/markdown'

const fixtureFile = './fixtures/tutorial/tutorial.thrift'
const exampleMarkdown = './fixtures/tutorial/tutorial.md'

describe('When generating markdown', () => {
    let results: string[]
    let markdown: string

    before(async () => {
        const file = resolve(fixtureFile)
        const contents = fs.readFileSync(file, { encoding: 'utf-8' })
        const thriftDoc = parse(contents) as ThriftDocument
        const helper = buildDoc(fixtureFile, thriftDoc)
        results = transform()(helper).split('\n')
    })

    markdown = fs.readFileSync(resolve(exampleMarkdown), { encoding: 'utf-8' })

    markdown.split('\n').forEach((l, index) => {
        it(`expect line ${index} to equal`, () => {
            expect(l).to.equal(results[index])
        })
    })
})
