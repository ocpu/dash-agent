import { Readable } from "stream";
import { Brev } from "brev";
import { IncomingMessage } from "http";

interface EventMap {
  "response": IncomingMessage
  "data": Buffer
  "end": void
  "close": void
  "readable": void
  "error": Error
}

declare function request(url: string): {
  go(): Promise<IncomingMessage>
  go(callback: (IncommingMessage) => void): void
  set(name: string, value: string | string[]): this
  set(pairs: { [name: string]: string | string[] }): this
  setHeader(name: string, value: string | string[]): this
  setHeaders(pairs: { [name: string]: string | string[] }): this
  compress(...order: ('identity' | 'gzip' | 'deflate' | 'compress' | 'br')[]): this
  decompress(): this
} & Brev<EventMap> & Readable

export = request
