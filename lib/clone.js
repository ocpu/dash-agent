const dashAgent = require('../')

module.exports = self => () => {
  const url = require('url').format(self)
  const req = dashAgent(self.method, url)
  req.set(self.headers)
  self.data.pipe(req._data)
  return req
}
