import {
    ConstDefinition,
    EnumDefinition,
    ExceptionDefinition,
    FunctionDefinition,
    IncludeDefinition,
    ServiceDefinition,
    StructDefinition,
    SyntaxType,
    ThriftDocument,
    ThriftErrors,
    ThriftStatement,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser';

export interface IDocNode {
    comments?: string[] | undefined;
    name: string;
    value?: string;
}
export interface IDocField extends IDocNode {
    default?: string | null;
    type: string;
    index?: number | string;
    required?: string;
}
export interface IDataStruct extends IDocNode {
    fields: IDocField[];
    type: string;
}
export interface ITypedDef extends IDocNode {
    type: string;
}
export interface IENum extends IDocNode {
    members: IDocNode[];
}
export interface IMethod extends IDocNode {
    params: IDocField[];
    throws: IDocField[];
    return: string;
}
export interface IService extends IDocNode {
    methods: IMethod[];
}
export interface IModule extends IDocNode {
    fileName: string;
    includes: string[];
    dataTypes: IDocField[];
}
export interface IDocument {
    constants: IDocField[];
    dataStructs: IDataStruct[];
    enums: IENum[];
    module: IModule;
    services: IService[];
    typedDefs: ITypedDef[];
}
export type Generator = (output?: string, sources?: ISourceOutput[]) => (doc: IDocument) => string

export interface ISourceOutput {
    doc: IDocument
    output: string
    generator: Generator
}

export type DataType = EnumDefinition | UnionDefinition | StructDefinition | TypedefDefinition;
export type DataStruct = StructDefinition | ExceptionDefinition;
export type Definition = DataType | DataStruct | FunctionDefinition | ConstDefinition;
export const isInclude = (_: ThriftStatement): _ is IncludeDefinition => _.type === SyntaxType.IncludeDefinition;
export const isService = (_: ThriftStatement): _ is ServiceDefinition => _.type === SyntaxType.ServiceDefinition;
export const isConstant = (_: ThriftStatement): _ is ConstDefinition => _.type === SyntaxType.ConstDefinition;
export const isTypedDef = (_: ThriftStatement): _ is TypedefDefinition => _.type === SyntaxType.TypedefDefinition;
export const isEnum = (_: ThriftStatement): _ is EnumDefinition => _.type === SyntaxType.EnumDefinition;
export const isStructure = (_: ThriftStatement): _ is DataStruct => _.type === SyntaxType.ExceptionDefinition ||
    _.type === SyntaxType.StructDefinition;
export const isDataType = (_: ThriftStatement): _ is DataType => _.type === SyntaxType.EnumDefinition ||
    _.type === SyntaxType.ExceptionDefinition ||
    _.type === SyntaxType.UnionDefinition ||
    _.type === SyntaxType.StructDefinition ||
    _.type === SyntaxType.TypedefDefinition;
export const isDocument = (_: ThriftDocument | ThriftErrors): _ is ThriftDocument =>
    _.type === SyntaxType.ThriftDocument
