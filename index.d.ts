declare interface MultipartRequest {
    query(key: string, value: string): MultipartRequest
    query(queries: Object): MultipartRequest
    set(name: string, value: string): MultipartRequest
    set(headers: Object): MultipartRequest
    attach(fieldName: string, data: Buffer, type: string, fileName?: string): MultipartRequest
    send(): Promise<Response>
}

declare interface URLEncodedRequest {
    query(key: string, value: string): URLEncodedRequest
    query(queries: Object): URLEncodedRequest
    set(name: string, value: string): URLEncodedRequest
    set(headers: Object): URLEncodedRequest
    add(key: string, value: string): URLEncodedRequest
    add(fileds: Object): URLEncodedRequest
    multipart(): MultipartRequest
    send(): Promise<Response>
}

declare interface Request {
    query(key: string, value: string): Request
    query(queries: Object): Request
    set(name: string, value: string): Request
    set(headers: Object): Request
    multipart(data: Object): URLEncodedRequest
    multipart(): MultipartRequest
    send(): Promise<Response>
    send(data: Buffer): Promise<Response>
    send(data: Array<Buffer>): Promise<Response>
    pipe(readable: ReadableStream): Promise<Response>
}

declare var Request: {
    new(method: string, url: string): Request
    prototype: Request
    get(url: string): Request
    head(url: string): Request
    post(url: string): Request
    put(url: string): Request
    del(url: string): Request
    connect(url: string): Request
    options(url: string): Request
    patch(url: string): Request
}

declare class Response {

    readonly headers: Object
    readonly statusCode: number
    readonly statusMessage: string
    readonly ok: boolean

    readerRaw(): Promise<ReadableStream>
    reader(): Promise<ReadableStream>
    buffer(): Promise<Buffer>
    text(encoding?: BufferEncoding = 'utf-8'): Promise<string>
    json(): Promise<Object>
}

export = Request