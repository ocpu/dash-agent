import { Duplex, Readable } from "stream";
import { Brev } from "brev";
import { IncomingHttpHeaders } from "http";
import { WriteStream } from "fs";

declare interface EventMap {
  "response": Response
  "data": Buffer
  "end": void
  "close": void
  "readable": void
  "error": Error
}
declare interface Response {
  readonly code: number
  readonly stream: Readable
  readonly headers: IncomingHttpHeaders
  buffer(): Promise<Buffer>
  text(encoding?: BufferEncoding): Promise<string>
  json<T = any>(): Promise<T>
}
declare interface RequestOptions {
  followRedirects?: boolean
  method?: string
}
declare function request(url: string, opts?: RequestOptions): request.Request
declare namespace request {
  export var supportedEncodings: string[]
  export function request(url: string, opts?: RequestOptions): request.Request
  export interface Request extends Brev<EventMap>, Duplex {
    go(): Promise<Response>
    go(callback: (res: Response) => void): void
    json<T = any>(): Promise<T>
    json(data: any): Promise<Response>
    json(data: any, callback: (res: Response) => void): void
    set<K extends keyof IncomingHttpHeaders>(name: K, value: string | string[]): Request
    set(pairs: IncomingHttpHeaders): Request
    query(name: string, value: string | string[]): Request
    query(pairs: { [name: string]: string | string[] }): Request
    clone(): Request
    toFile(file: string, encoding?: BufferEncoding): WriteStream
  }
  interface FormData {
    readonly stream: Readable
    conteentType: string
    attach(name: string, value: string): FormData
    attach(data: {[name: string]: string}): FormData
  }
  interface Multipart {
    readonly stream: Readable
    conteentType: string
    attach(field: string, data: FormData): Multipart
    attach(field: string, data: Multipart): Multipart
    attach(field: string, data: Object, contentType?: string, filename?: string): Multipart
    attach(field: string, data: Readable, contentType?: string, filename?: string): Multipart
    attach(field: string, data: Buffer, contentType?: string, filename?: string): Multipart
    attach(field: string, data: string, contentType?: string, filename?: string): Multipart
    attach(field: string, data: number, contentType?: string, filename?: string): Multipart
  }
  export function formData(data?: {[name: string]: string}): FormData
  export function multipart(): Multipart
}


export = request
