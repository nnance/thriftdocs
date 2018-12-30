import { readFileSync } from 'fs';
import * as path from 'path'

import {
    BaseType,
    BooleanLiteral,
    Comment,
    CommentBlock,
    ConstDefinition,
    ConstList,
    ConstMap,
    ConstValue,
    DoubleConstant,
    EnumDefinition,
    ExceptionDefinition,
    ExponentialLiteral,
    FloatLiteral,
    HexLiteral,
    Identifier,
    IncludeDefinition,
    IntConstant,
    IntegerLiteral,
    ListType,
    MapType,
    ServiceDefinition,
    SetType,
    StringLiteral,
    StructDefinition,
    SyntaxNode,
    SyntaxType,
    ThriftDocument,
    ThriftStatement,
    TypedefDefinition,
    UnionDefinition,
    VoidType,
} from '@creditkarma/thrift-parser'

export interface IDocNode {
    comments?: string[] | undefined
    name: string
}

export interface IDocField extends IDocNode {
    default?: string | null
    type: string
    index?: number | string
    required?: string
    value?: string
}

export interface IDataStruct extends IDocNode {
    fields: IDocField[]
    type: string
}

export interface IConstant extends IDocNode {
    type: string
    value: string
}

export interface IMethod extends IDocNode {
    params: IDocField[]
    throws: IDocField[]
    return: string
}

export interface IService extends IDocNode {
    methods: IMethod[],
}

export interface IModule extends IDocNode {
    dataTypes: IDocField[]
}

export interface IDocument {
    constants: IDocField[]
    dataStructs: IDataStruct[]
    dataTypes: IDataStruct[]
    module: IModule
    services: IService[]
}

type DataType = EnumDefinition | UnionDefinition | StructDefinition | TypedefDefinition
type DataStruct = StructDefinition | ExceptionDefinition

const isInclude = (_: ThriftStatement): _ is IncludeDefinition => _.type === SyntaxType.IncludeDefinition
const isService = (_: ThriftStatement): _ is ServiceDefinition => _.type === SyntaxType.ServiceDefinition
const isStructure = (_: ThriftStatement): _ is DataStruct =>
    _.type === SyntaxType.ExceptionDefinition ||
    _.type === SyntaxType.StructDefinition
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

type LiteralValue = StringLiteral | BooleanLiteral | IntegerLiteral | HexLiteral |
FloatLiteral | ExponentialLiteral

const getLiteralVal = (fld: LiteralValue) => {
    function literalTransform<U>(
        r: LiteralValue,
        e: (_: StringLiteral) => U,
        f: (_: BooleanLiteral) => U,
        g: (_: IntegerLiteral) => U,
        h: (_: HexLiteral) => U,
        i: (_: FloatLiteral) => U,
        j: (_: ExponentialLiteral) => U,
    ): U {
        switch (r.type) {
            case SyntaxType.StringLiteral: return e(r as StringLiteral)
            case SyntaxType.BooleanLiteral: return f(r as BooleanLiteral)
            case SyntaxType.IntegerLiteral: return g(r as IntegerLiteral)
            case SyntaxType.HexLiteral: return h(r as HexLiteral)
            case SyntaxType.FloatLiteral: return i(r as FloatLiteral)
            case SyntaxType.ExponentialLiteral: return j(r as ExponentialLiteral)
            default: return e(r)
        }
    }

    return literalTransform(
        fld,
        (e) => `"${e.value}"`,
        (f) => `${f.value}`,
        (g) => `${g.value}`,
        (h) => `#${h.value}`,
        (i) => `${i.value}`,
        (j) => `${j.value}`,
    )
}

const transformConst = (fld: ConstValue) => {
    function constTransform<U>(
        r: ConstValue,
        e: (_: ConstList) => U,
        f: (_: ConstMap) => U,
        g: (_: LiteralValue) => U,
        z: (_: Identifier) => U,
    ): U {
        switch (r.type) {
            case SyntaxType.ConstList: return e(r as ConstList)
            case SyntaxType.ConstMap: return f(r as ConstMap)
            case SyntaxType.DoubleConstant: return g((r as DoubleConstant).value)
            case SyntaxType.IntConstant: return g((r as IntConstant).value)
            default: return z(r as Identifier)
        }
    }

    return constTransform(
        fld,
        (e) => `list<${transformField(e)}>`,
        (f) => `map<${transformField(f)}>`,
        getLiteralVal,
        (z) => `[${z.value}](#${z.value})`,
    )
}

const filterCommentBlocks = (body: ThriftStatement[]) => body
    .filter(isInclude)
    .reduce((prev: Comment[], stmt) => prev.concat(stmt.comments), [])
    .filter((_) => _.type = SyntaxType.CommentBlock) as CommentBlock[]

const findFirstComment = (_: CommentBlock, index: number) =>
    Array.isArray(_.value) ? _.value[0].indexOf('first') > 0 : false

// empty comment lines start with *, remove it
const fixEmptyComments = (lines: string[]) => lines.map((l) => l === '*' ? '' : l)

const transformComments = (_: Comment[]) => _
    .filter((c) => c.type === SyntaxType.CommentBlock)
    .reduce((prev, b) => prev.concat(b.value), [] as string[])
    .map((l) => l === '*' ? '' : l)

const docSection = (t: DataType | DataStruct): IDataStruct => ({
    comments: transformComments(t.comments),
    fields: isStructure(t) ? t.fields.map((f) => ({
        comments: transformComments(f.comments),
        default: f.defaultValue ? transformConst(f.defaultValue) : '',
        index: f.fieldID ? f.fieldID.value : '',
        name: f.name.value,
        required: f.requiredness || '',
        type: transformField(f.fieldType),
    })) : [],
    name: t.name.value,
    type: t.type.split('Definition')[0],
})

const docConstant = (t: ConstDefinition): IConstant => ({
    comments: transformComments(t.comments),
    name: t.name.value,
    type: transformField(t.fieldType),
    value: transformConst(t.initializer),
})

export const buildDoc = (fileName: string, doc: ThriftDocument): IDocument => {
    return {
        constants: doc.body
            .filter(isConstant)
            .sort((a, b) => sortAsc(a.name.value, b.name.value))
            .map(docConstant),
        dataStructs: doc.body
            .filter(isStructure)
            .sort((a, b) => sortAsc(a.name.value, b.name.value))
            .map(docSection),
        dataTypes: doc.body
            .filter(isDataType)
            .sort((a, b) => sortAsc(a.name.value, b.name.value))
            .map(docSection),
        module: {
            comments: filterCommentBlocks(doc.body)
                .filter(findFirstComment)
                .reduce((prev, _) => prev.concat(fixEmptyComments(_.value)), [] as string[]),
            dataTypes: doc.body
                .filter(isDataType)
                .sort((a, b) => sortAsc(a.name.value, b.name.value))
                .map((t) => ({
                    name: t.name.value,
                    type: t.type.split('Definition')[0],
                })),
            name: path.parse(fileName).base.split('.')[0],
        },
        services: doc.body
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
                        throws: f.throws.map((t) => ({
                            name: t.name.value,
                            type: transformField(t.fieldType),
                        })),
                    })) as IMethod[],
                name: _.name.value,
            })) as IService[],
    }
}
