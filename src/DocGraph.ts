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
    ThriftStatement,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import { IThriftFile } from './ThriftFile';
import { IThriftGraph } from './ThriftGraph';

export interface IDocGraph {
    file: IThriftFile
    doc: IDocument
    dependencies: IDocGraph[]
}

export type DocLoader = (graph: IThriftGraph) => Promise<IDocGraph>

export const docLoader: DocLoader = async (graph) => {
    const doc = transformDoc(graph.file)
    const dependencies = await Promise.all(graph.dependencies.map(docLoader))

    return {
        dependencies,
        doc,
        file: graph.file,
    }
}

const transformDoc = (file: IThriftFile): IDocument => {
    const doc = file.doc
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
            name: file.textFile.file.base,
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

const docField = (_: FieldDefinition): IDocField => ({
    ...docNode(_),
    default: _.defaultValue,
    index: _.fieldID ? _.fieldID.value : '',
    required: _.requiredness || '',
    type: _.fieldType.type,
})

const docSection = (_: DataType | DataStruct | EnumDefinition): IDataStruct => ({
    ...docNode(_),
    fields: isStructure(_) ? _.fields.map(docField) : [],
    type: _.type,
})

const docConstant = (_: ConstDefinition): ITypedDef => ({
    ...docNode(_),
    type: _.fieldType.type,
    value: _.initializer.type,
})

const docEnum = (_: EnumDefinition): IENum => ({
    ...docNode(_),
    members: _.members.map((m) => ({
        ...docNode(m),
        value: m.initializer ? m.initializer.value : undefined,
    })),
})

const docDataType = (_: DataType): ITypedDef => ({
    ...docNode(_),
    type: _.type,
})

const docFunction = (_: FunctionDefinition): IMethod => ({
    ...docNode(_),
    params: _.fields.map(docField),
    return: _.returnType.type,
    throws: _.throws.map(docField),
})

const docTypedDef = (_: TypedefDefinition): ITypedDef => ({
    ...docNode(_),
    type: _.definitionType.type,
})

const docServiceDef = (_: ServiceDefinition): IService => ({
    ...docNode(_),
    methods: _.functions.sort(sortByName).map(docFunction),
})

const sortByName = (a: Definition, b: Definition) =>
    a.name.value > b.name.value ? 1 : a.name.value < b.name.value ? -1 : 0

type DataType = EnumDefinition | UnionDefinition | StructDefinition | TypedefDefinition;
type DataStruct = StructDefinition | ExceptionDefinition;
type Definition = DataType | DataStruct | FunctionDefinition | ConstDefinition;
const isInclude = (_: ThriftStatement): _ is IncludeDefinition => _.type === SyntaxType.IncludeDefinition;
const isService = (_: ThriftStatement): _ is ServiceDefinition => _.type === SyntaxType.ServiceDefinition;
const isConstant = (_: ThriftStatement): _ is ConstDefinition => _.type === SyntaxType.ConstDefinition;
const isTypedDef = (_: ThriftStatement): _ is TypedefDefinition => _.type === SyntaxType.TypedefDefinition;
const isEnum = (_: ThriftStatement): _ is EnumDefinition => _.type === SyntaxType.EnumDefinition;
const isStructure = (_: ThriftStatement): _ is DataStruct => _.type === SyntaxType.ExceptionDefinition ||
    _.type === SyntaxType.StructDefinition;
const isDataType = (_: ThriftStatement): _ is DataType => _.type === SyntaxType.EnumDefinition ||
    _.type === SyntaxType.ExceptionDefinition ||
    _.type === SyntaxType.UnionDefinition ||
    _.type === SyntaxType.StructDefinition ||
    _.type === SyntaxType.TypedefDefinition;

interface IDocNode {
    comments?: string[] | undefined;
    name: string;
    value?: string;
}

interface IDocField extends IDocNode {
    default?: FieldDefinition['defaultValue'];
    type: string;
    index?: number | string;
    required?: string;
}

interface IDataStruct extends IDocNode {
    fields: IDocField[];
    type: string;
}

interface ITypedDef extends IDocNode {
    type: string;
}

interface IENum extends IDocNode {
    members: IDocNode[];
}

interface IMethod extends IDocNode {
    params: IDocField[];
    throws: IDocField[];
    return: SyntaxType;
}

interface IService extends IDocNode {
    methods: IMethod[];
}

interface IModule extends IDocNode {
    includes: string[];
    dataTypes: IDocField[];
}

interface IDocument {
    constants: IDocField[];
    dataStructs: IDataStruct[];
    enums: IENum[];
    module: IModule;
    services: IService[];
    typedDefs: ITypedDef[];
}
