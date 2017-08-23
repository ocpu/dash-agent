const { parse: parseURL } = require('url')
const util = require('util')
const https = require('https')
const zlib = require('zlib')

function includes(src, sub) {
    if (!util.isArray(src) && (typeof src === 'object' || typeof src === 'function')) return sub in src
    return !!~src.indexOf(sub)
}

function Request(method, url) {
    this.request = Object.assign({}, parseURL(url), { method, headers: {} })
    this.request.search = this.request.search || ''
}

Request.prototype.query = function query(key, value) {
    if (typeof key === 'object') {
        Object.getOwnPropertyNames(key).forEach(k => this.query(k, key[k]))
        return this
    }
    
    if (typeof key === 'object' || typeof key === 'function' || typeof key === 'boolean', typeof key === 'undefined')
        throw new TypeError(`Invalid key type: ${typeof key}`)
    
    if (typeof value === 'function' || (typeof value === 'object' && !util.isArray(value)))
        throw new TypeError(`Invalid value type: ${typeof value}`)

    if (Array.isArray(value)) for (let val of value)
        this.request.search  += `${this.request.search[0] === '?' ? '&' : '?'}${encodeURIComponent(key)}=${encodeURIComponent(val)}`
    else this.request.search += `${this.request.search[0] === '?' ? '&' : '?'}${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    return this
}

Request.prototype.set = function set(name, value) {
    if (typeof name === 'object') {
        for (let key of Object.getOwnPropertyNames(name)) this.set(key, name[key])
        return this
    }

    if (!util.isString(name))
        throw new TypeError(`Invalid name type: ${typeof name}`)

    this.request.headers[name] = value.toString()
    return this
}

Request.prototype.multipart = function multipart(data) {
    if (data) {
        const req = new URLEncodedRequest()
        return
    }
    return new MultipartRequest(this.request)
}

Request.prototype.send = function send(data) {
    return new Promise((resolve, reject) => {
        const req = {
            host: this.request.host,
            path: this.request.path + this.request.search + (this.request.hash || ''),
            headers: this.request.headers,
            method: this.request.method,
            port: this.request.port || this.request.protocol === 'https:' ? 443 : 80
        }
        if (this.request.auth)
            req['auth'] = this.request.auth
        const request = https.request(req, res => {
            resolve(new Response(res))
        })
        if (data) {
            if (util.isArray(data)) for (let d of data)
                request.write(d)
            else request.write(data)
        }
        request.end()
    })
}

function MultipartRequest(request) {
    this.request = request
    this.bufs = []
}

MultipartRequest.boundary = '--MultipartRequest'

MultipartRequest.prototype.query = Request.prototype.query
MultipartRequest.prototype.set = Request.prototype.set
MultipartRequest.prototype.attach = function attach(fieldName, data, type, fileName) {
    if (data === void 0)
        return this
    let head = `\r\n--${MultipartRequest.boundary}\r\nContent-Disposition: form-data; name="${fieldName}"`
    if (filename)
        head += `; filename="${filename}"`
    head += `\r\nContent-Type: ${type || 'application/octet-stream'}`
    this.bufs.push(
        new Buffer(head + '\r\n\r\n'),
        data
    )
    return this
}
MultipartRequest.prototype.send = function send() {
    this.bufs.push(new Buffer(`\r\n--${MultipartRequest.boundary}--`))
    this.request.headers['Content-Type'] = `multipart/form-data; boundary=${MultipartRequest.boundary}`
    return Request.prototype.send.call(this, this.bufs)
}

function URLEncodedRequest(request) {
    this.request = request
    this.buf = ''
}

URLEncodedRequest.prototype.boundary = '--URLEncodedRequest'

URLEncodedRequest.prototype.query = Request.prototype.query
URLEncodedRequest.prototype.set = Request.prototype.set
URLEncodedRequest.prototype.multipart = function multipart() {
    const req = new MultipartRequest(this.request)
    const { query } = parseURL(this.buf, true)
    Object.getOwnPropertyNames(query).forEach(key => {
        req.attach(
            key,
            util.isArray(query[key]) ? JSON.stringify(query[key]) : query[key],
            util.isArray(query[key]) ? 'application/json' : 'text/plain'
        )
    })
    return req
}
URLEncodedRequest.prototype.add = function add(key, value) {
    if (typeof key === 'object') {
        Object.getOwnPropertyNames(key).forEach(k => this.add(k, key[k]))
        return this
    }
    
    if (typeof key === 'object' || typeof key === 'function' || typeof key === 'boolean', typeof key === 'undefined')
        throw new TypeError(`Invalid key type: ${typeof key}`)
    
    if (typeof value === 'function' || (typeof value === 'object' && !util.isArray(value)))
        throw new TypeError(`Invalid value type: ${typeof value}`)

    if (Array.isArray(value)) for (let val of value)
        this.request.search  += `${this.request.search[0] === '?' ? '&' : '?'}${encodeURIComponent(key)}=${encodeURIComponent(val)}`
    else this.request.search += `${this.request.search[0] === '?' ? '&' : '?'}${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    return this
}
URLEncodedRequest.prototype.send = function send() {
    this.buf = this.buf.substring(1)
    this.request.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    return Request.prototype.send.call(this, this.buf)
}
function Response(res) {
    this.stream = res
    this.headers = res.headers
    this.statusCode = res.statusCode,
    this.statusMessage = res.statusMessage
    this.ok = 200 <= res.statusCode < 300
}

Response.prototype.statusMessage = ''
Response.prototype.statusCode = 0
Response.prototype.ok = false

Response.prototype.readerRaw = function reader() { return Promise.resolve(this.stream) }
Response.prototype.reader = function reader() {
    return new Promise(resolve => {
        const encoding = this.headers['content-encoding'] || ''
        let stream
        if (!encoding)
            stream = this.stream
        else if (includes(encoding, 'gzip')) {
            stream = zlib.createGunzip()
            stream.pipe(this.stream)
        }
        else if (includes(encoding, 'deflate')) {
            stream = zlib.createDeflate()
            stream.pipe(this.stream)
        }
        resolve(stream)
    })
}
Response.prototype.buffer = function buffer() { return this.reader().then(reader => new Promise(resolve => {
    const data = []
    let totalLength = 0
    reader
        .on('data', d => {data.push(d);totalLength += d.length})
        .once('end', () => resolve(Buffer.concat(data, totalLength)))
}))}
Response.prototype.text = function text(enconding) { return this.buffer().then(buf => buf.toString(enconding || 'utf-8')) }
Response.prototype.json = function json() { return this.text().then(JSON.parse) }

function request(method, url) {
    return new Request(method, url)
}
['get', 'post', 'put', 'patch', 'head', 'options'].forEach(method => {
    request[method] = function (url) {
        return new Request(method.toUpperCase(), url)
    }
})
request.del = function (url) {
    return new Request('DELETE', url)
}
module.exports = request
