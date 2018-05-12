const { Duplex, PassThrough } = require('stream')
const brev = require('brev')
const d = require('d')
const autoBind = require('d/auto-bind')

const request = (url, options) => brev().mixin((() => {
  const extra = Object.assign({}, options)
  const urlParsed = require('url').parse(url, true)
  const stream = new Duplex
  Object.defineProperties(stream, autoBind({
    _read: d(function () {
      this.on('response', res => {
        let pushedNull = false
        res.on('data', c => {
          pushedNull = c === null
          stream.push(c)
        }).on('end', () => !pushedNull && stream.push(null))
      })
      stream.go()
    }),
    _write: d(function (chunk, _, cb) {
      if (!stream._req) stream._req = require((urlParsed.protocol || 'http:').slice(0, -1)).request(
        Object.assign({ method: 'POST' }, urlParsed, extra),
        res => this.emit('response', res)
      ); else stream._req.write(chunk)
      cb()
    }),
    _final: d(function (cb) {
      stream._req.end()
      cb()
    }),
    go: d(function (cb) {
      require((urlParsed.protocol || 'http:').slice(0, -1)).request(
        Object.assign({ method: 'GET' }, urlParsed, extra),
        res => this.emit('response', res)
      ).end()
      if (cb) return this.once('response', cb)
      return new Promise(resolve => {
        this.once('response', resolve)
      })
    }),
    decompress: d(function() {

    })
  }))
  stream.set = stream.setHeaders = stream.setHeader = function (key, value) {
    extra.headers = extra.headers || {}
    if (arguments.length == 2) {
      if (key in extra.headers)
        Array.isArray(value) ? extra.headers.concat(value) : extra.headers.push(value)
      else extra.headers[key] = Array.isArray(value) ? value : [value]
    } else {
      for (const name in key) if (key.hasOwnProperty(name)) {
        if (name in extra.headers)
          Array.isArray(value) ? extra.headers.concat(value) : extra.headers.push(value)
        else extra.headers[name] = Array.isArray(value) ? value : [value]
      }
    }
  }
  return stream
})())
module.exports = request
// const stream = new Writable
// stream._write = function (chunk, encoding, cb) {
//   console.log(chunk.toString())
//   cb()
// }
// stream._final = function (cb) {
//   console.log('end')
//   cb()
// }

// const test = new PassThrough()
// test.pipe(stream)
// test.write('test')
// test.write('test')
// test.write('test')
// test.write('test')
// test.end()
