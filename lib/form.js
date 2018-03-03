'use strict'

const header = require('./header')

module.exports = self => form => {
  if (!Object.keys(self.headers).find(item => /content\-type/ig.test(item)))
    header(self)('Content-Type', 'application/x-www-form-urlencoded')
  self.data.write(
    Object.getOwnPropertyNames(form)
      .map(key => [key, form[key]])
      .reduce(
        (data, [key, value]) => data + (Array.isArray(value) ?
          value.reduce((val, value) => `${val}&${key}=${value}`) :
          `&${key}=${value}`
        ),
        ''
      )
      .substring(1)
  )
  return self.builder
}
