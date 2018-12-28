import { parse } from 'path'

import {
    Comment,
    CommentBlock,
    IncludeDefinition,
    ServiceDefinition,
    SyntaxType,
    ThriftDocument,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

const isInclude = (_: ThriftStatement): _ is IncludeDefinition => _.type === SyntaxType.IncludeDefinition
const isService = (_: ThriftStatement): _ is ServiceDefinition => _.type === SyntaxType.ServiceDefinition

export class Helpers {
    private fileName: string
    private doc: ThriftDocument

    constructor(fileName: string, doc: ThriftDocument) {
        this.fileName = fileName
        this.doc = doc
    }

    public module() {
        const filterCommentBlocks = (body: ThriftStatement[]) => body
            .filter(isInclude)
            .reduce((prev: Comment[], stmt) => prev.concat(stmt.comments), [])
            .filter((_) => _.type = SyntaxType.CommentBlock) as CommentBlock[]

        const findFirstComment = (_: CommentBlock) =>
            Array.isArray(_.value) ? _.value[0].indexOf('first') > 0 : false

        // empty comment lines start with *, remove it
        const fixEmptyComments = (lines: string[]) => lines.map((l) => l === '*' ? '' : l)

        return {
            comments: filterCommentBlocks(this.doc.body)
                .filter(findFirstComment)
                .reduce((prev, _) => prev.concat(fixEmptyComments(_.value)), [] as string[]),
            name: parse(this.fileName).base.split('.')[0],
        }
    }
}
