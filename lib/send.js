'use strict'

const response = require('./response')

module.exports = self => () => new Promise((resolve, reject) => {
  const search = '?' + Object.getOwnPropertyNames(self.query)
    .map(key => [key, self.query[key]])
    .reduce(
      (search, [key, value]) => search + (Array.isArray(value) ?
        value.reduce((val, value) => `${val}&${key}=${value}`) :
        `&${key}=${value}`
      ),
      ''
    ).substring(1)
  self.search = search
  const request = require(self.protocol.slice(0, -1))
    .request(self, res => {
      resolve(response(res))
    }).on('error', reject)
  self.data.pipe(request)
  self.data.writable = true
  self.data.end()
})
