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

declare function request(method: string, url: string): Request
declare namespace request {
    function get(url: string): Request
    function head(url: string): Request
    function post(url: string): Request
    function put(url: string): Request
    function del(url: string): Request
    function connect(url: string): Request
    function options(url: string): Request
    function patch(url: string): Request
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

export = request