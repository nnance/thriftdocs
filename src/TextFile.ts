import { ParsedPath } from 'path'

export interface ITextFile {
    file: ParsedPath
    pathName: string
    content: string
}

export type Reader = (path: string) => Promise<ITextFile>
