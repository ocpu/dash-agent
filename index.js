const { Duplex, PassThrough, Readable } = require('stream')
const { createGunzip, createDeflate } = require('zlib')
const brev = require('brev')
const d = require('d')
const autoBind = require('d/auto-bind')

let decompressStream, LZWDecoder
try { decompressStream = require('iltorb').compressStream } catch (_) {}
try { LZWDecoder = require('lzw-stream').LZWDecoder } catch (_) {}


const supportedEncodings = ['identity', 'gzip', 'deflate']
if (decompressStream) supportedEncodings.push('compress')
if (LZWDecoder) supportedEncodings.push('br')
const response = res => ({
  /** @type {Readable} */
  stream: (() => {return decompress(res.pipe(new PassThrough),res.headers['content-encoding'])})(),
  get headers() {return res.headers},
  get code() {return res.statusCode},
  buffer(){let a=[],l=0;return new Promise(r=>this.stream.on('data',c=>(void a.push(c))||(l+=c.length)).once('end',_=>r(Buffer.concat(a,l))))},
  text(encoding='utf8') {return this.buffer().then(buf => buf.toString(encoding))},
  json() {return this.text().then(JSON.parse)},
})
const request = (url, options) => brev().mixin((() => {
  const extra = Object.assign({followRedirects:true}, options)
  const urlParsed = require('url').parse(url, true)
  const stream = new Duplex
  let i = 0
  Object.defineProperties(stream, autoBind({
    _read: d(function () {
      this.once('response', res =>
        (i++ === 0)&&res.stream.on('data', c => stream.push(c)).once('end', stream.push)
      )
      send()
    }),
    _write: d(function (chunk, _, cb) {
      if (!stream._req) stream._req = require((urlParsed.protocol || 'http:').slice(0, -1)).request(
        Object.assign({ method: 'POST' }, urlParsed, extra),
        res => this.emit('response', response(res))
      )
      stream._req.write(chunk)
      cb()
    }),
    _final: d(function (cb) {
      stream._req.end()
      cb()
    }),
    json: d(function (data, cb) {
      if (data === void 0) return stream.go().then(res => res.json())
      if (typeof data === 'function') return stream.go(res => res.json().then(data))
      if (extra.headers?!Object.keys(extra.headers).map(s=>s.toLowerCase()).includes('accept-encoding'):true)
        stream.set('Content-Type', 'application/json')
      stream.write(JSON.stringify(data))
      return cb ? stream.on('response', cb) : stream.once('response')
    }),
    go: d(function (cb) {
      return send(void 0, cb)
    })
  }))
  const send = (data, cb) => {
    req(require((urlParsed.protocol || 'http:').slice(0, -1)), Object.assign({ method: 'GET' }, urlParsed, extra), stream, data)
    if (cb) return stream.once('response', cb)
    return new Promise(resolve =>
      stream.once('response', resolve)
    )
  }
  stream.set = function (key, value) {
    extra.headers = extra.headers || {}
    if (typeof key !== 'object') extra[key] = Array.isArray(value) ? value.join(', ') : value
    else Object.keys(key).forEach(k => extra[k] = Array.isArray(key[k]) ? key[k].join(', ') : key[k])
  }
  stream.query = function (key, value) {
    extra.query = extra.query || {}
    if (typeof key !== 'object') extra[key] = Array.isArray(value) ? value.join(', ') : value
    else Object.keys(key).forEach(k => extra[k] = Array.isArray(key[k]) ? key[k].join(', ') : key[k])
  }
  stream.clone = () => request(url, extra)
  stream.toFile = (file, encoding='utf8') => stream.pipe(require('fs').createWriteStream(file, encoding))
  return stream
})())

const encodingToStream = encoding => 
  encoding === 'gzip' ? createGunzip() :
  encoding === 'deflate' ? createDeflate() :
  encoding === 'compress' && LZWDecoder !== void 0 ? new LZWDecoder :
  encoding === 'br' && decompressStream !== void 0 ? decompressStream() :
  new PassThrough
const decompress = (stream, contentEncoding) => {
  if (!contentEncoding) return stream
  const streams = contentEncoding.split(/,\s?/g).map(encodingToStream)
  let decompressedStream = streams.pop()
  if (streams.length) streams.reduceRight(
    (stream, c) => stream.pipe(c),
    decompressedStream
  )
  stream.pipe(decompressedStream)
  return decompressedStream
}
const req = (mod, obj, self, data) => !obj.followRedirects ? mod.request(obj, self.emit('response', res)).end(data) : mod.request(
  obj,
  res => res.statusCode === 301 || res.statusCode === 307
    ? req(mod, Object.assign({}, obj, require('url').parse(res.headers['location'], true)), self, data)
    : self.emit('response', response(res))
).end(data)

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const nonce = (n=16) => new Array(n).fill('').map(() => chars[Math.random() * chars.length | 0]).join('')

request.supportedEncodings = supportedEncodings
request.request = request
request.formData = (data) => {
  const stream = new PassThrough
  let firstChunkWritten = false
  if (data) {
    firstChunkWritten = true
    stream.write(Object.keys(data).reduce((a, key) => `${a?a+'&':''}${key}=${data[key]}`, ''))
  }
  return {
    get stream() { return stream },
    contentType: 'application/x-www-form-urlencoded',
    attach(name, value) {
      if (typeof name === 'object') {
        stream.write(Object.keys(data).reduce((a, key) => `${firstChunkWritten?'':a?a+'&':''}${key}=${data[key]}`, ''))
        firstChunkWritten = true
      } else if (firstChunkWritten) {
        stream.write(`&${name}=${value}`)
      } else {
        firstChunkWritten = true
        stream.write(`${name}=${value}`)
      }
    }
  }
}
request.multipart = () => {
  const boundary = nonce(8)
  const stream = new PassThrough
  stream.end = (d, e, cb) => {
    stream.write('--' + boundary + '--')
    PassThrough.prototype.end.call(stream, d, e, cb)
  }
  return {
    get stream() { return stream },
    contentType: 'multipart/form-data; boundary=' + boundary,
    attach(field, value, contentType, filename) {
      stream.write('--' + boundary + '\r\n')
      if (typeof value.stream === 'object' && typeof value.contentType === 'string' && typeof value.attach === 'function') {
        stream.write(`Content-Disposition: ${value.contentType}; name="${field}"${contentType&&(`; filename="${contentType}"`)}\r\n`)
        stream.pipe(value.stream , {end:false})
      } else if (typeof value === 'object') {
        if (value instanceof Buffer) {
          stream.write(`Content-Disposition: ${contentType || 'application/octet-stream'}; name="${field}"${filename&&(`; filename="${filename}"`)}\r\n`)
          stream.write(value)
        } else if (require('is-stream')(value)) {
          stream.write(`Content-Disposition: ${contentType || 'application/octet-stream'}; name="${field}"${filename&&(`; filename="${filename}"`)}\r\n`)
          stream.pipe(value, {end:false})
        } else {
          stream.write(`Content-Disposition: ${contentType || 'application/json'}; name="${field}"${filename&&(`; filename="${filename}"`)}\r\n`)
          stream.write(JSON.stringify(value))
        }
      } else {
        stream.write(`Content-Disposition: ${contentType || 'text/plain'}; name="${field}"${filename&&(`; filename="${filename}"`)}\r\n`)
        stream.write(value.toString())
      }
      stream.write('\r\n\r\n')
      return this
    }
  }
}

module.exports = request
