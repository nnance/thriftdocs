type func = (x: any) => any

export const pipe = (...funcs: func[]) => (x: any) => funcs.reduce((prev, cur) => cur(prev), x)
export const compose = (...funcs: func[]) => (x: any) => funcs.reduceRight((prev, cur) => cur(prev), x)
export const curry = (fn: (...args: any) => any, ...args: any) =>
  (fn.length <= args.length) ? fn(...args) : (...more: any) => curry(fn, ...args, ...more);
