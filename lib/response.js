'use strict'

const { createGunzip, createDeflate } = require('zlib')
const { LZWDecoder } = require('lzw-stream')
const { decompressStream } = require('iltorb')

module.exports = res => ({
  code: res.statusCode,
  headers: res.headers,
  message: res.statusMessage,
  ok: res.statusCode < 300 && res.statusCode >= 200,
  stream: async () => {
    /**@type {string} */
    const encoding = res.headers['content-encoding'] || 'identity'
    const streams = encoding.split(/,\s?/g).map(
      encoding => 
        encoding === 'identity' ? new (require('stream').Transform) :
        encoding === 'gzip' ? createGunzip() :
        encoding === 'deflate' ? createDeflate() :
        encoding === 'compress' ? new LZWDecoder :
        encoding === 'br' ? decompressStream() :
        new (require('stream').Transform)
    )
    let stream = streams.pop()
    if (streams.length) streams.reduceRight(
      (stream, c) => stream.pipe(c),
      stream
    )

    res.pipe(stream)
    return stream
  },
  buffer: () => new Promise(resolve => {
    const bufs = []
    let length = 0
    res.on('data', d => bufs.push(d) && (length += d.length)).once('end', () =>
      resolve(Buffer.concat(bufs, length))
    )
  })
  ,
  text(charset='utf8') {
    return this.buffer().then(buffer => buffer.toString(charset))
  },
  json() {
    return this.text().then(JSON.parse)
  }
})
