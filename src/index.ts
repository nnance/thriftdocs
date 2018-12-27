import { parse } from 'path'

export const moduleName = (fileName: string) => parse(fileName).base.split('.')[0]
