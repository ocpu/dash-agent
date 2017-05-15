require('tap').mochaGlobals()
const expect = require('expect.js')

const RequestBuilder = require('../')

const mock = require('mock-require')
mock('http', {
    request(opts, callback) {
        console.log(opts, callback)
        return {
            end() {}
        }
    }
})

beforeEach(() => {
    mock.stopAll()
})

it('builds a request fine', done => {
    mock('http', {
        request(opts, callback) {
            return {
                end() {
                    done()
                }
            }
        }
    })
    RequestBuilder.request('GET', 'http://google.com').send()
})

it('builds a get request fine', done => {
    mock('http', {
        request(opts, callback) {
            expect(opts).to.eql()
            return {
                end() {
                    done()
                }
            }
        }
    })
    RequestBuilder.get('http://opencubes.io').send()
})
