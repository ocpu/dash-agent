#!/usr/bin/env node
'use strict'

const express = require('express')
const app = express()

app.post('/', (req, res) => {
  const bufs = []
  let length = 0

  req.on('data',
    d => bufs.push(d) && (length += d.length))
    .once('end', () => {
      console.log(req.url, JSON.stringify(req.headers, null, 0), Buffer.concat(bufs, length).toString())
    })
  res.end(JSON.stringify({ status: 'ok' }))
}).listen(6000)
