declare class RequestBuilder {
    static request(method: string, url: string): RequestBuilder
    header(name: string, value: string, condition?: boolean | (() => boolean)): this
    headers(headers: Object, condition?: boolean | (() => boolean)): this
    static get(url: string): RequestBuilder
    static head(url: string): RequestBuilder
    static post(url: string): RequestBuilder
    static put(url: string): RequestBuilder
    static delete(url: string): RequestBuilder
    static connect(url: string): RequestBuilder
    static options(url: string): RequestBuilder
    static trace(url: string): RequestBuilder
    static patch(url: string): RequestBuilder
    send(body?: Buffer): Promise<Response>
}

declare class Response {

    readonly headers: Object
    readonly status: number
    readonly message: string

    buffer(): Promise<Buffer>

    text(): Promise<string>

    json(): Promise<Object>
}

export = RequestBuilder