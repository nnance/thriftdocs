import { parse } from 'path'

import {
    BaseType,
    Comment,
    CommentBlock,
    ConstDefinition,
    EnumDefinition,
    Identifier,
    IncludeDefinition,
    ListType,
    MapType,
    ServiceDefinition,
    SetType,
    StructDefinition,
    SyntaxNode,
    SyntaxType,
    ThriftDocument,
    ThriftStatement,
    TypedefDefinition,
    UnionDefinition,
    VoidType,
} from '@creditkarma/thrift-parser'

export interface IMethod {
    name: string
    params: Array<{
        name: string
        type: string,
    }>,
    return: string
}

export interface IService {
    methods: IMethod[],
    name: string
}

type DataType = EnumDefinition | UnionDefinition | StructDefinition | TypedefDefinition

const isInclude = (_: ThriftStatement): _ is IncludeDefinition => _.type === SyntaxType.IncludeDefinition
const isService = (_: ThriftStatement): _ is ServiceDefinition => _.type === SyntaxType.ServiceDefinition
const isConstant = (_: ThriftStatement): _ is ConstDefinition => _.type === SyntaxType.ConstDefinition
const isDataType = (_: ThriftStatement): _ is DataType =>
    _.type === SyntaxType.EnumDefinition ||
    _.type === SyntaxType.ExceptionDefinition ||
    _.type === SyntaxType.UnionDefinition ||
    _.type === SyntaxType.StructDefinition ||
    _.type === SyntaxType.TypedefDefinition

const sortAsc = (a: string, b: string) => a > b ? 1 : a < b ? -1 : 0

const transformField = (fld: SyntaxNode): string => {
    function syntaxNodeTransform<U>(
        r: SyntaxNode,
        e: (_: VoidType) => U,
        f: (_: ListType) => U,
        g: (_: MapType) => U,
        h: (_: SetType) => U,
        i: (_: BaseType) => U,
        z: (_: Identifier) => U,
    ): U {
        switch (r.type) {
            case SyntaxType.VoidKeyword: return e(r as VoidType)
            case SyntaxType.ListType: return f(r as ListType)
            case SyntaxType.MapType: return g(r as MapType)
            case SyntaxType.SetType: return h(r as SetType)
            case SyntaxType.StringKeyword: return i(r as BaseType)
            case SyntaxType.I8Keyword: return i(r as BaseType)
            case SyntaxType.BinaryKeyword: return i(r as BaseType)
            case SyntaxType.BoolKeyword: return i(r as BaseType)
            case SyntaxType.ByteKeyword: return i(r as BaseType)
            case SyntaxType.DoubleKeyword: return i(r as BaseType)
            case SyntaxType.EnumKeyword: return i(r as BaseType)
            case SyntaxType.I16Keyword: return i(r as BaseType)
            case SyntaxType.I32Keyword: return i(r as BaseType)
            case SyntaxType.I64Keyword: return i(r as BaseType)
            default: return z(r as Identifier)
        }
    }

    return syntaxNodeTransform(
        fld,
        (e) => `void`,
        (f) => `list<${transformField(f.valueType)}>`,
        (g) => `map<${transformField(g.valueType)}>`,
        (h) => `set<${transformField(h.valueType)}>`,
        (i) => i.type.split('Keyword')[0].toLowerCase(),
        (z) => `[${z.value}](#${z.value})`,
    )
}

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

    public services(): IService[] {
        return this.doc.body
            .filter(isService)
            .map((_) => ({
                methods: _.functions
                    .sort((a, b) => sortAsc(a.name.value, b.name.value))
                    .map((f) => ({
                        name: f.name.value,
                        params: f.fields.map((p) => ({
                            name: p.name.value,
                            type: transformField(p.fieldType),
                        })),
                        return: transformField(f.returnType),
                    })),
                name: _.name.value,
            }))
    }

    public dataTypes() {
        return this.doc.body
            .filter(isDataType)
            .sort((a, b) => sortAsc(a.name.value, b.name.value))
            .map((t) => ({
                name: t.name.value,
            }))
    }

    public constants() {
        return this.doc.body
            .filter(isConstant)
            .sort((a, b) => sortAsc(a.name.value, b.name.value))
    }
}
