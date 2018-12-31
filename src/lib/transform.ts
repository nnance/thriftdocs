import {
    BaseType,
    BooleanLiteral,
    ConstList,
    ConstMap,
    ConstValue,
    DoubleConstant,
    ExponentialLiteral,
    FloatLiteral,
    HexLiteral,
    Identifier,
    IntConstant,
    IntegerLiteral,
    ListType,
    MapType,
    PropertyAssignment,
    SetType,
    StringLiteral,
    SyntaxNode,
    SyntaxType,
    VoidType,
} from '@creditkarma/thrift-parser'
import { join } from 'path';

export const transformField = (fld: SyntaxNode): string => {
    function syntaxNodeTransform<U>(
        r: SyntaxNode,
        e: (_: VoidType) => U,
        f: (_: ListType) => U,
        g: (_: MapType) => U,
        h: (_: SetType) => U,
        i: (_: BaseType) => U,
        j: (_: PropertyAssignment) => U,
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
            case SyntaxType.PropertyAssignment: return j(r as PropertyAssignment)
            default: return z(r as Identifier)
        }
    }

    return syntaxNodeTransform(
        fld,
        (e) => `void`,
        (f) => `list<${transformField(f.valueType)}>`,
        (g) => `map<${transformField(g.keyType)}, ${transformField(g.valueType)}>`,
        (h) => `set<${transformField(h.valueType)}>`,
        (i) => i.type.split('Keyword')[0].toLowerCase(),
        (j) => `${transformConst(j.name)}:${transformConst(j.initializer)}`,
        (z) => `[${z.value}](#${z.value})`,
    )
}

type LiteralValue = StringLiteral | BooleanLiteral | IntegerLiteral | HexLiteral |
FloatLiteral | ExponentialLiteral

export const getLiteralVal = (fld: LiteralValue) => {
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

export const transformConst = (fld: ConstValue) => {
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
            case SyntaxType.StringLiteral: return g(r)
            default: return z(r as Identifier)
        }
    }

    return constTransform(
        fld,
        (e) => `list<${transformField(e)}>`,
        (f) => `{${f.properties.map(transformField).join(', ')}}`,
        getLiteralVal,
        (z) => `[${z.value}](#${z.value})`,
    )
}
