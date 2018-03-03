'use strict'

const create = module.exports = (method, url) => {
  const stream = new (require('stream').PassThrough)()
  stream.writable = false
  const self = Object.assign(
    {},
    require('url').parse(url, true),
    { method, headers: {}, data: stream }
  )
  self.builder = {
    send: require('./lib/send')(self),
    query: require('./lib/query')(self),
    header: require('./lib/header')(self),
    set: require('./lib/header')(self),
    form: require('./lib/form')(self),
    attach: require('./lib/attach')(self)
  }
  return self.builder
}

;['get', 'post', 'put', 'patch', 'head', 'options', 'connect'].forEach(
  method => create[method] = url => create(method.toUpperCase(), url)
)
create.del = url => create('DELETE', url)
