import * as path from 'path'

import {
    Comment,
    CommentBlock,
    ConstDefinition,
    EnumDefinition,
    ExceptionDefinition,
    FunctionDefinition,
    IncludeDefinition,
    ServiceDefinition,
    StructDefinition,
    SyntaxType,
    ThriftDocument,
    ThriftStatement,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import {
    transformConst,
    transformField,
} from './lib/transform'

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

export interface ITypedDefs extends IDocNode {
    type: string
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
    typedDefs: ITypedDefs[]
}

type DataType = EnumDefinition | UnionDefinition | StructDefinition | TypedefDefinition
type DataStruct = StructDefinition | ExceptionDefinition
type Definition = DataType | DataStruct | FunctionDefinition | ConstDefinition

const isInclude = (_: ThriftStatement): _ is IncludeDefinition => _.type === SyntaxType.IncludeDefinition
const isService = (_: ThriftStatement): _ is ServiceDefinition => _.type === SyntaxType.ServiceDefinition
const isConstant = (_: ThriftStatement): _ is ConstDefinition => _.type === SyntaxType.ConstDefinition
const isTypedDef = (_: ThriftStatement): _ is TypedefDefinition => _.type === SyntaxType.TypedefDefinition
const isStructure = (_: ThriftStatement): _ is DataStruct =>
    _.type === SyntaxType.ExceptionDefinition ||
    _.type === SyntaxType.StructDefinition
const isDataType = (_: ThriftStatement): _ is DataType =>
    _.type === SyntaxType.EnumDefinition ||
    _.type === SyntaxType.ExceptionDefinition ||
    _.type === SyntaxType.UnionDefinition ||
    _.type === SyntaxType.StructDefinition ||
    _.type === SyntaxType.TypedefDefinition

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

const docNode = (t: DataType | DataStruct | ConstDefinition): IDocNode => ({
    comments: transformComments(t.comments),
    name: t.name.value,
})

const docSection = (t: DataType | DataStruct ): IDataStruct => ({
    ...docNode(t),
    fields: isStructure(t) ? t.fields.map((f) => ({
        comments: transformComments(f.comments),
        default: f.defaultValue ? transformConst(f.defaultValue) : '',
        index: f.fieldID ? f.fieldID.value : '',
        name: f.name.value,
        required: f.requiredness || '',
        type: transformField(f.fieldType),
    })) : [],
    type: t.type.split('Definition')[0],
})

const docConstant = (t: ConstDefinition): IConstant => {
    return {
        ...docNode(t),
        type: transformField(t.fieldType),
        value: transformConst(t.initializer),
    }
}

const sortByName = ( a: Definition, b: Definition ) =>
    a.name.value > b.name.value ? 1 : a.name.value < b.name.value ? -1 : 0

export const buildDoc = (fileName: string, doc: ThriftDocument): IDocument => {
    return {
        constants: doc.body
            .filter(isConstant)
            .sort(sortByName)
            .map(docConstant),
        dataStructs: doc.body
            .filter(isStructure)
            .sort(sortByName)
            .map(docSection),
        dataTypes: doc.body
            .filter(isDataType)
            .sort(sortByName)
            .map(docSection),
        module: {
            comments: filterCommentBlocks(doc.body)
                .filter(findFirstComment)
                .reduce((prev, _) => prev.concat(fixEmptyComments(_.value)), [] as string[]),
            dataTypes: doc.body
                .filter(isDataType)
                .sort(sortByName)
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
                    .sort(sortByName)
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
                    })),
                name: _.name.value,
            })),
        typedDefs: doc.body
            .filter(isTypedDef)
            .sort(sortByName)
            .map((t) => ({
                comments: transformComments(t.comments),
                name: t.name.value,
                type: transformField(t.definitionType),
            })),
    }
}
