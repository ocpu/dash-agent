const { parse: parseURL } = require('url')
const { isArray, isBuffer, isObject, isString } = require('util')
const https = require('https')
const zlib = require('zlib')

function includes(src, sub) {
    if (!isArray(src) && (typeof src === 'object' || typeof src === 'function')) return sub in src
    return !!~src.indexOf(sub)
}

const isStream = (arg) => {
    return '_read' in arg && 'readable' in arg && 'pipe' in arg
}

const forEach = (array, cb) => {
    const len = array.length
    let at = 0
    while (at < len)
        cb(array[at], at++, array)
}
const each = (obj, cb) => {
    if (isArray(obj))
        forEach(obj, cb)
    else if (isObject(obj)) {
        const keys = Object.keys(obj)
        const len = keys.length
        let at = 0
        while (at < len)
            cb(keys[at], obj[keys[at++]], obj)
    }
}

class Request { 
    constructor(method, url) {
        this.request = Object.assign({}, parseURL(url), { method, headers: {} })
        this.request.search = this.request.search || ''
        this.data = []
        this.method = method
        this.url = url
    }

    static get boundary() { return '--MultipartRequest' }

    query(key, value) {
        if (typeof key === 'object') {
            each(key, this.query.bind(this))
            return this
        }
        
        if (typeof key === 'object' || typeof key === 'function' || typeof key === 'boolean', typeof key === 'undefined')
            throw new TypeError(`Invalid key type: ${typeof key}`)
        
        if (typeof value === 'function' || (typeof value === 'object' && !isArray(value)))
            throw new TypeError(`Invalid value type: ${typeof value}`)

        if (isArray(value)) each(value, val => {
            this.request.search  += `${this.request.search[0] === '?' ? '&' : '?'}${encodeURIComponent(key)}=${encodeURIComponent(val)}`
        })
        else this.request.search += `${this.request.search[0] === '?' ? '&' : '?'}${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        return this
    }

    set(name, value) {
        if (typeof name === 'object') {
            each(name, this.set.bind(this))
            return this
        }

        if (!isString(name))
            throw new TypeError(`Invalid name type: ${typeof name}`)

        this.request.headers[name] = value.toString()
        return this
    }

    write(data) {
        if (isBuffer(data))
            this.data.push(data)
        else
            this.data.push(new Buffer(data.toString()))
        return this
    }

    formData(data) {
        if (!('content-type' in Object.keys(this.request.headers).map(key => key.toLowerCase())))
            this.set('Content-Type', 'application/x-www-form-urlencoded')
        each(data, (key, value) => {
            this.write((this.data.length !== 0 ? '&' : '') + `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        })
        return this
    }

    attach(field, data, options) {
        if (!('content-type' in Object.keys(this.request.headers).map(key => key.toLowerCase())))
            this.set('Content-Type', 'multipart/form-data; boundary=' + Request.boundary)
        if (data === void 0)
            return this
        let head = `\r\n--${Request.boundary}\r\nContent-Disposition: form-data; name="${field}"`
        if (isObject(options) && options.filename)
            head += `; filename="${options.filename}"`
        let type
        if (isObject(data))
            type = 'application/json'
        else if (!isBuffer(data) && !isStream(data))
            type = options || 'text/plain'
        else
            type = (isObject(options) && options.contentType) || 'application/octet-stream'
        head += `\r\nContent-Type: ${type}`
        this.write(new Buffer(head + '\r\n\r\n'))
        this.write(isStream(data) || isBuffer(data) ? data : new Buffer(isObject(data) ? JSON.stringify(data) : data.toString()))
        return this
    }

    clone() {
        const req = new Request()
        req.request = Object.assign({}, this.request)
        req.data = this.data.slice()
        return req
    }

    pipe(stream, contentType) {
        return new Promise(resolve => {
            if (contentType && !('content-type' in Object.keys(this.request.headers).map(key => key.toLowerCase())))
                this.set('Content-Type', contentType)
            const reqOpts = {
                host: this.request.host,
                path: this.request.path + this.request.search + (this.request.hash || ''),
                headers: this.request.headers,
                method: this.request.method,
                port: this.request.port || this.request.protocol === 'https:' ? 443 : 80
            }
            const request = https.request(reqOpts, res => {
                resolve(new Response(res))
            })
            stream.pipe(request)
        })
    }
    
    send(data) {
        return new Promise(resolve => {
            if (data) {
                if (isObject(data)) {
                    if (!('content-type' in Object.keys(this.request.headers).map(key => key.toLowerCase())))
                        this.set('Content-Type', 'application/json')
                    this.write(new Buffer(JSON.stringify(data)))
                } else this.write(data)
            }
            const reqOpts = {
                host: this.request.host,
                path: this.request.path + this.request.search + (this.request.hash || ''),
                headers: this.request.headers,
                method: this.request.method,
                port: this.request.port || this.request.protocol === 'https:' ? 443 : 80
            }
            if (this.request.auth)
                reqOpts['auth'] = this.request.auth
            const request = https.request(reqOpts, res => {
                resolve(new Response(res))
            })
            each(this.data, data => request.write(data))
            request.end()
        })
    }
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
