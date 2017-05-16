'use strict';

module.exports = function (define) {define(function () {
function RequestBuilder(method, url) {
    if (!(this instanceof RequestBuilder))
        throw new TypeError('Cannot call a class as a function')

    var _require$parse = require('url').parse(url),
        host = _require$parse.host,
        path = _require$parse.path,
        protocol = _require$parse.protocol,
        port = _require$parse.port;

    this._httpObj = protocol.startsWith('https') ? require('https') : require('http');
    this._opts = { method: method, host: host, path: path, port: port, protocol: protocol };
}

RequestBuilder.prototype.header = function header(name, value, condition) {
    if (typeof condition !== 'undefined') {
        if (typeof condition === 'function') {
            if (condition()) this._opts.headers[name] = value;
        } else if (condition) this._opts.headers[name] = value;
    } else this._opts.headers[name] = value;
    return this;
}

RequestBuilder.prototype.headers = function headers(headers, condition) {
    if (typeof condition !== 'undefined') {
        if (typeof condition === 'function') {
            if (condition()) for (var key in headers) if (headers.hasOwnProperty(key)) Object.defineProperty(this._opts.headers, key, Object.getOwnPropertyDescriptor(headers, key));
        } else if (condition) for (var key in headers) if (headers.hasOwnProperty(key)) Object.defineProperty(this._opts.headers, key, Object.getOwnPropertyDescriptor(headers, key));
    } else for (var key in headers) if (headers.hasOwnProperty(key)) Object.defineProperty(this._opts.headers, key, Object.getOwnPropertyDescriptor(headers, key));
    return this;
}

RequestBuilder.prototype.send = function send(body) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var req = _this._httpObj.request(_this._opts, function (res) {
            var bufs = [];
            res.on('data', function (d) {
                return bufs.push(d);
            });
            res.on('end', function () {
                resolve(new Response(Buffer.concat(bufs), res.headers, res.statusCode, res.statusMessage));
            });
        });
        req.end(body);
    });
}

RequestBuilder.request = function request(method, url) {
    return new RequestBuilder(method, url)
}
RequestBuilder.get = function get(url) {
    return RequestBuilder.request('GET', url);
}
RequestBuilder.head = function head(url) {
    return RequestBuilder.request('HEAD', url);
}
RequestBuilder.post = function post(url) {
    return RequestBuilder.request('POST', url);
}
RequestBuilder.put = function put(url) {
    return RequestBuilder.request('PUT', url);
}
RequestBuilder.delete = function _delete(url) {
    return RequestBuilder.request('DELETE', url);
}
RequestBuilder.connect = function connect(url) {
    return RequestBuilder.request('OPTIONS', url);
}
RequestBuilder.options = function options(url) {
    return RequestBuilder.request('OPTIONS', url);
}
RequestBuilder.trace = function trace(url) {
    return RequestBuilder.request('OPTIONS', url);
}
RequestBuilder.patch =  function patch(url) {
    return RequestBuilder.request('PATCH', url);
}

function Response(buffer, headers, status, message) {
    if (!(this instanceof RequestBuilder))
        throw new TypeError('Cannot call a class as a function')

    this._buffer = buffer;
    this._headers = headers;
    this._status = status;
    this._message = message;
}

Response.prototype.buffer = function buffer() {
    return Promise.resolve(this._buffer);
}

Response.prototype.text = function text() {
    return Promise.resolve(this._buffer.toString());
}

Response.prototype.json = function json() {
    return this.text().then(JSON.parse);
}
Object.defineProperty(Response.prototype, 'headers', {
    get: function get() {
        return this._headers
    }
})
Object.defineProperty(Response.prototype, 'status', {
    get: function get() {
        return this._status
    }
})
Object.defineProperty(Response.prototype, 'message', {
    get: function get() {
        return this._message
    }
})
return RequestBuilder
})}(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory()});