import * as path from 'path'

import {
    Comment,
    CommentBlock,
    ConstDefinition,
    EnumDefinition,
    EnumMember,
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
    SyntaxType,
    ThriftDocument,
    ThriftStatement,
    TypedefDefinition,
} from '@creditkarma/thrift-parser'

import {
    getLiteralVal,
    transformConst,
    transformField,
} from './lib/transform'

import {
    DataStruct,
    DataType,
    Definition,
    IDataStruct,
    IDocField,
    IDocNode,
    IDocument,
    IENum,
    IMethod,
    isConstant,
    isDataType,
    isEnum,
    IService,
    isInclude,
    isService,
    isStructure,
    isTypedDef,
    ITypedDef,
} from './types'

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
            includes: doc.body
                .filter(isInclude)
                .map((_) => _.path.value),
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

const docFieldType = (_: FieldDefinition | ConstDefinition) => ({
    type: transformField(_.fieldType),
})

const docField = (_: FieldDefinition): IDocField => ({
    ...docNode(_),
    ...docFieldType(_),
    default: _.defaultValue ? transformConst(_.defaultValue) : '',
    index: _.fieldID ? _.fieldID.value : '',
    required: _.requiredness || '',
})

const docSection = (_: DataType | DataStruct | EnumDefinition): IDataStruct => ({
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
