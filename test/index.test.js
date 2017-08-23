require('tap').mochaGlobals()
const expect = require('expect.js')
const mock = require('mock-require')

const request = require('../')

beforeEach(() => {
    mock.stopAll()
})

it('builds a request fine', done => {
    mock('https', {
        request(opts, callback) {
            return {
                end() {
                    done()
                }
            }
        }
    })
    request('', '').send()
})

for (let method of ['get', 'post', 'head', 'options', 'put', 'patch']) it(`builds a ${method} request fine`, done => {
    mock('https', {
        request(opts, callback) {
            expect(opts.host).to.be('opencubes.io')
            expect(opts.path).to.be('/')
            expect(opts.method).to.be(method.toUpperCase())
            return {
                end() {
                    done()
                }
            }
        }
    })
    request[method]('https://opencubes.io').send()
})

it('adds a header', done => {
    mock('https', {
        request(opts, cb) {
            expect(opts.headers).to.eql({ 'Some-Header': 'header value' })
            return {
                end() {
                    done()
                }
            }
        }
    })
    RequestBuilder.get('https://opencubes.io').header('Some-Header', 'header value').send()
})

it('adds a headers', done => {
    mock('https', {
        request(opts, cb) {
            expect(opts.headers).to.eql({ 'Some-Header': 'header value', 'Some-Header2': 'header value 2' })
            return {
                end() {
                    done()
                }
            }
        }
    })
    RequestBuilder.get('https://opencubes.io').header({ 'Some-Header': 'header value', 'Some-Header2': 'header value 2' }).send()
})

it('adds a header with a truthly condition', done => {
    mock('https', {
        request(opts, cb) {
            expect(opts.headers).to.eql({ 'Some-Header': 'header value' })
            return {
                end() {
                    done()
                }
            }
        }
    })
    RequestBuilder.get('https://opencubes.io', true).header('Some-Header', 'header value').send()
})

it('adds a headers with a truthly condition', done => {
    mock('https', {
        request(opts, cb) {
            expect(opts.headers).to.eql({ 'Some-Header': 'header value', 'Some-Header2': 'header value 2' })
            return {
                end() {
                    done()
                }
            }
        }
    })
    RequestBuilder.get('https://opencubes.io').header({ 'Some-Header': 'header value', 'Some-Header2': 'header value 2' }, true).send()
})

it('does not add a header with a falsy condition', done => {
    mock('https', {
        request(opts, cb) {
            expect(opts.headers).to.eql(undefined)
            return {
                end() {
                    done()
                }
            }
        }
    })
    RequestBuilder.get('https://opencubes.io', false).header('Some-Header', 'header value').send()
})

it('adds a headers with a truthly condition', done => {
    mock('https', {
        request(opts, cb) {
            expect(opts.headers).to.be(undefined)
            return {
                end() {
                    done()
                }
            }
        }
    })
    RequestBuilder.get('https://opencubes.io').header({ 'Some-Header': 'header value', 'Some-Header2': 'header value 2' }, false).send()
})
