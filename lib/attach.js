'use strict'

const isStream = require('is-stream')

const header = require('./header')

const boundary = '--dash-agent'
module.exports = self => (field, data, options) => {

  header(self)('Content-Type', 'multipart/form-data; boundary=' + boundary)

  if (data === void 0)
    return self.builder
  let head = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="${field}"`
  if (typeof options === 'object' && options.filename)
    head += `; filename="${options.filename}"`
  const type = 
    typeof data === 'object' ? 'application/json' :
    !Buffer.isBuffer(data) && !isStream(data) ? options || 'text/plain' :
    (typeof options === 'object' && options.contentType) ||
    'application/octet-stream'
  head += `\r\nContent-Type: ${type}`
  self.data.write(new Buffer(head + '\r\n\r\n'))
  if (isStream(data)) data.on('data', self.data.write)
  else self.data.write(
    Buffer.isBuffer(data) ? data :
    new Buffer(
      typeof data === 'object' ? JSON.stringify(data) : 
      data.toString()
    )
  )
  return self.builder
}
