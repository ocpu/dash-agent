'use strict'

const query = module.exports = self => (key, value) => {
  if (typeof key === 'function')
    throw new TypeError('key cannot be a function')
  if (typeof value === 'object' && !Array.isArray(value))
    throw new TypeError('value cannot be a object')
  if (typeof key !== 'object') {
    const val = value && typeof value.toString === 'function' && !Array.isArray(value) && value.toString() || value
    if (key in self.query) {
      if (Array.isArray(self.query[key]))
        self.query[key].push(val)
      else self.query[key] = [self.query[key], val]
    } else self.query[key] = val
  } else Object.getOwnPropertyNames(self.query)
    .map(key => [key, self.query[key]])
    .forEach(args => query(self)(...args))
  return self.builder
}
