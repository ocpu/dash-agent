'use strict'

const create = require('./index')

;(async () => {
const res = await create
  .post('http://localhost:6000')
  .attach('json', {
    hello: 'world'
  })
  .send()
const text = await res.json()
text //?
})()
