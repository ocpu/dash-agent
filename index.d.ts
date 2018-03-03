import stream from 'stream'

declare interface Response {
    readonly headers: Object
    readonly code: number
    readonly message: string
    readonly ok: boolean

    stream(): Promise<stream.Readable>
    buffer(): Promise<Buffer>
    text(encoding: BufferEncoding = 'utf-8'): Promise<string>
    json(): Promise<Object>
}

declare interface AttachOptions {
    contentType: string
    filename: string
}

declare interface Request {
    readonly method: string
    readonly url: string

    query(key: string, value: string): Request
    query(queries: Object): Request
    set(name: string, value: string | number): Request
    set(headers: Object): Request
    header(name: string, value: string | number): Request
    header(headers: Object): Request
    /**
     * Send form data url encoded 
     */
    form(data: Object): Request
    /**
     * form data
     */
    attach(field: string, data: Buffer, options?: AttachOptions): Request
    attach(field: string, data: string, contentType?: string = 'text/plain'): Request
    attach(field: string, data: Object): Request
    clone(): Request
    send(): Promise<Response>
    send(data: Buffer): Promise<Response>
    send(data: Object): Promise<Response>
    send(data: string): Promise<Response>
    pipe(stream: stream.Readable, contentType?: string): Promise<Response>
}

declare function create(method: string, url: string): Request
declare namespace create {
    function get(url: string): Request
    function head(url: string): Request
    function post(url: string): Request
    function put(url: string): Request
    function del(url: string): Request
    function connect(url: string): Request
    function options(url: string): Request
    function patch(url: string): Request
}

export = create