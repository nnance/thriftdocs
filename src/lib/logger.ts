export const log = (_: Console) => ({
    dir: (doc: any) => {
        _.dir(doc, {depth: null})
        return doc
    },
    error: (doc: any) => {
        _.error(doc)
        return doc
    },
    log: (doc: any) => {
        _.log(doc)
        return doc
    },
})
