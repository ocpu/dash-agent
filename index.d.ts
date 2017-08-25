import stream from 'stream'

declare interface AttachOptions {
    contentType: string
    filename: string
}

declare interface Request {
    query(key: string, value: string): Request
    query(queries: Object): Request
    set(name: string, value: string): Request
    set(headers: Object): Request
    pipe(stream: stream.Readable): Request
    /**
     * Send form data url encoded 
     */
    form(data: Object): Request
    /**
     * form data
     */
    attach(field: string, data: Buffer, options?: AttachOptions): Request
    attach(field: string, data: stream.Readable, options?: AttachOptions): Request
    attach(field: string, data: string, contentType?: string = 'text/plain'): Request
    attach(field: string, data: Object): Request
    write(data: Buffer): Request
    write(data: string): Request
    send(): Promise<Response>
    send(data: Buffer): Promise<Response>
    send(data: Object): Promise<Response>
    send(data: string): Promise<Response>
}

declare class Response {

    readonly headers: Object
    readonly statusCode: number
    readonly statusMessage: string
    readonly ok: boolean

    readerRaw(): Promise<stream.Readable>
    reader(): Promise<stream.Readable>
    buffer(): Promise<Buffer>
    text(encoding?: BufferEncoding = 'utf-8'): Promise<string>
    json(): Promise<Object>
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

export = request