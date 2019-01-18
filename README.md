# ThriftDocs

Generate Thrift Docs in Markdown, HTML, etc

## Architecture

The architecure of the application is a basic transformation pipeline that with each step having a well defined input and output.  The pipeline is composed via a job allowing each step to be replaced to support different transformations.  It also functional composition for dependency injection and eliminates all I/O from the pipeline.

fileName => ThriftFile => ThriftGraph => DocGraph => MarkDown[] => file[]

## To DO

- [ ] ThriftGraph => DocGraph
- [ ] DocGraph => MarkDown[]
- [ ] MarkDown[] => file[]
- [ ] MarkDownJob
