# dash-agent
[![npm](https://img.shields.io/npm/v/dash-agent.svg?style=flat-square)](https://www.npmjs.com/package/dash-agent)

Making requests easier

## Simple usage

```js
const dashAgent = require('dash-agent')
dashAgent.get('https://google.com').send().then(async res => {
    console.log('status code:', res.statusCode)
    if (res.ok)
        console.log('Requset was successful')
    const body = await res.text()
    console.log('body:', body)
})
```

## Reference

Main export: `function(method: string, url: string): Request`

```js
dashAgent('GET', 'https://google.com')
dashAgent('PUT', 'http://my.url')
```

Exports: `function [method](url: string)` where method is [get, put, post, del, patch, head, options]

```js
dashAgent.get('https://google.com') // == dashAgent('GET', 'https://google.com')
dashAgent.del('https://google.com') // == dashAgent('DELETE', 'https://google.com')
```

### Request

#### method
`not-null string`
#### url
`not-null string`

#### query(key, value)
Set additional values to the requests query string.

|Parameter|Type|Description|
|-|-|-|
|key|`string`|Query key|
|value|`string`|Query value|

Returns: [`Request`](#request) - The current request

#### query(queries)
Set additional values to the requests query string.

|Parameter|Type|Description|
|-|-|-|
|queries|`Object`|Key value pairs query string|

Returns: [`Request`](#request) - The current request

#### set(name, value)
Set headers on the request.

|Parameter|Type|Description|
|-|-|-|
|name|`string`|Header name|
|value|`string` \| `number`|Header value|

Returns: [`Request`](#request) - The current request

#### set(headers)
Set headers on the request.

|Parameter|Type|Description|
|-|-|-|
|headers|`Object`|Headers|

Returns: [`Request`](#request) - The current request

#### form(data)
Send form data with the request.

This sets the Content-Type header to `application/x-www-form-urlencoded`.

|Parameter|Type|Description|
|-|-|-|
|data|`Object`|Data from a form|

Returns: [`Request`](#request) - The current request

#### attach(field, data[, options])
Attach any data to the request. Like files.

This sets the Content-Type header to `multipart/form-data`.

|Parameter|Type|Description|
|-|-|-|
|field|`string`|Data field name|
|data|`Buffer`|Data you want to attach to the request|
|[options]|`{ [contentType]: string, [filename]: string }`|Content type and potencial filename of data|

Returns: [`Request`](#request) - The current request

#### attach(field, data[, contentType])
Attach any text data to the request.

This sets the Content-Type header to `multipart/form-data`.

|Parameter|Type|Description|
|-|-|-|
|field|`string`|Data field name|
|data|`string`|String data you want to attach to the request|
|[contentType]|`string`|The type of the data. Defaults to `"text/plain"`|

Returns: [`Request`](#request) - The current request

#### attach(field, data)
Attach JSON data to the request.

This sets the Content-Type header to `multipart/form-data`.

|Parameter|Type|Description|
|-|-|-|
|field|`string`|Name of json content|
|data|`Object`|json content|

Returns: [`Request`](#request) - The current request

#### write(data)
Write data to the request.

|Parameter|Type|Description|
|-|-|-|
|data|`Buffer` \| `string`|Data to write to the request|

Returns: [`Request`](#request) - The current request

#### clone()
Clone the request.

Returns: [`Request`](#request) - The cloned request

#### send([data])
End the request and send it down the pipe.

|Parameter|Type|Description|
|-|-|-|
|[data]|`Buffer` \| `Object` \| `string`|Any last data you want to send down the pipe|

Returns: `Promise<Response>`

#### pipe(stream[, contentType])
|Parameter|Type|Description|
|-|-|-|
|stream|`stream.Readable`|Pipe the stream to the request|
|[contentType]|`string`|Content type|

Returns: `Promise<Response>`

### Response

#### headers
`not-null Object`

#### statusCode
`not-null number`

#### statusMessage
`not-null string`

#### ok
`not-null boolean` - If the response code between 200 and 299

#### readerRaw()
Get the response stream.

Returns: `Promise<stream.Readable>` - The unprocessed stream.

#### reader()
Tries to determine the encoding and return the appropiete stream.

Returns: `Promise<stream.Readable>` - The processed stream.

#### bufferRaw()
Using [readerRaw()](#reader) to create the buffer.

Returnes: `Promise<Buffer>` - The buffered response.

#### buffer()
Using [reader()](#reader) to create the buffer.

Returnes: `Promise<Buffer>` - The buffered response.
#### text([encoding])
Using [buffer()](#buffer) to get the text content.

|Parameters|Type|Description|
|-|-|-|
|[encoding]|`ascii` \| `utf8` \| `utf16le` \| `ucs2` \| `base64` \| `latin1` \| `binary` \| `hex`|Text encoding. Default `'utf8'`|

Returns: `Promise<string>` - The text response.

#### json()
Get a json Object from the response.

Returns: `Promise<Object>` - A json response object.
