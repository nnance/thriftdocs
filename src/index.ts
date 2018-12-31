import * as path from 'path'

import {
    Comment,
    CommentBlock,
    ConstDefinition,
    EnumDefinition,
    EnumMember,
    ExceptionDefinition,
    FieldDefinition,
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
    getLiteralVal,
    transformConst,
    transformField,
} from './lib/transform'

export interface IDocNode {
    comments?: string[] | undefined
    name: string
    value?: string
}

export interface IDocField extends IDocNode {
    default?: string | null
    type: string
    index?: number | string
    required?: string
}

export interface IDataStruct extends IDocNode {
    fields: IDocField[]
    type: string
}

export interface ITypedDef extends IDocNode {
    type: string
}

export interface IENum extends IDocNode {
    members: IDocNode[]
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
    enums: IENum[]
    module: IModule
    services: IService[]
    typedDefs: ITypedDef[]
}

type DataType = EnumDefinition | UnionDefinition | StructDefinition | TypedefDefinition
type DataStruct = StructDefinition | ExceptionDefinition
type Definition = DataType | DataStruct | FunctionDefinition | ConstDefinition

const isInclude = (_: ThriftStatement): _ is IncludeDefinition => _.type === SyntaxType.IncludeDefinition
const isService = (_: ThriftStatement): _ is ServiceDefinition => _.type === SyntaxType.ServiceDefinition
const isConstant = (_: ThriftStatement): _ is ConstDefinition => _.type === SyntaxType.ConstDefinition
const isTypedDef = (_: ThriftStatement): _ is TypedefDefinition => _.type === SyntaxType.TypedefDefinition
const isEnum = (_: ThriftStatement): _ is EnumDefinition => _.type === SyntaxType.EnumDefinition
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

const docNode = (_: DataType | DataStruct | ConstDefinition | EnumMember |
    FunctionDefinition | ServiceDefinition | FieldDefinition): IDocNode => ({
        comments: _.comments
            .filter((c) => c.type === SyntaxType.CommentBlock)
            .reduce((prev, b) => prev.concat(b.value), [] as string[])
            .map((l) => l === '*' ? '' : l),
        name: _.name.value,
})

const docType = (_: DataType | DataStruct | EnumDefinition) => ({
    type: _.type.split('Definition')[0],
})

const docFieldType = (_: FieldDefinition | ConstDefinition ) => ({
    type: transformField(_.fieldType),
})

const docField = (_: FieldDefinition): IDocField => ({
    ...docNode(_),
    ...docFieldType(_),
    default: _.defaultValue ? transformConst(_.defaultValue) : '',
    index: _.fieldID ? _.fieldID.value : '',
    required: _.requiredness || '',
})

const docSection = (_: DataType | DataStruct | EnumDefinition ): IDataStruct => ({
    ...docNode(_),
    ...docType(_),
    fields: isStructure(_) ? _.fields.map(docField) : [],
})

const docConstant = (_: ConstDefinition): ITypedDef => ({
    ...docNode(_),
    ...docFieldType(_),
    value: transformConst(_.initializer),
})

const docEnum = (_: EnumDefinition): IENum => ({
    ...docNode(_),
    members: _.members.map((m) => ({
        ...docNode(m),
        value: m.initializer ? getLiteralVal(m.initializer.value) : '',
    })),
})

const docDataType = (_: DataType): ITypedDef => ({
    ...docNode(_),
    ...docType(_),
})

const docFunction = (_: FunctionDefinition): IMethod => ({
    ...docNode(_),
    params: _.fields.map(docField),
    return: transformField(_.returnType),
    throws: _.throws.map(docField),
})

const docTypedDef = (_: TypedefDefinition): ITypedDef => ({
    ...docNode(_),
    type: transformField(_.definitionType),
})

const docServiceDef = (_: ServiceDefinition): IService => ({
    ...docNode(_),
    methods: _.functions.sort(sortByName).map(docFunction),
})

const sortByName = (a: Definition, b: Definition) =>
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
        enums: doc.body
            .filter(isEnum)
            .sort(sortByName)
            .map(docEnum),
        module: {
            comments: filterCommentBlocks(doc.body)
                .filter(findFirstComment)
                .reduce((prev, _) => prev.concat(fixEmptyComments(_.value)), [] as string[]),
            dataTypes: doc.body
                .filter(isDataType)
                .sort(sortByName)
                .map(docDataType),
            name: path.parse(fileName).base.split('.')[0],
        },
        services: doc.body
            .filter(isService)
            .map(docServiceDef),
        typedDefs: doc.body
            .filter(isTypedDef)
            .sort(sortByName)
            .map(docTypedDef),
    }
}
