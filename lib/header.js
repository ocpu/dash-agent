'use strict'

const makeHeader = module.exports = self => (header, value) => {
  header
  value
  if (typeof header === 'function')
    throw new TypeError('header cannot be a function')
  if (typeof value === 'object' && !Array.isArray(value))
    throw new TypeError('value cannot be a object')
  if (typeof header !== 'object') {
    const val = value && typeof value.toString === 'function' && !Array.isArray(value) && value.toString() || value
    if (header in self.headers) {
      if (Array.isArray(self.headers[header]))
        self.headers[header].push(val)
      else self.headers[header] = [self.headers[header], val]
    } else self.headers[header] = val
  } else Object.getOwnPropertyNames(self.headers)
    .map(header => [header, self.headers[header]])
    .forEach(args => makeHeader(self)(...args))
  return self.builder
}
