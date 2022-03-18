const net = require('net')
// const fs = require('fs')
const fs = require('fs').promises
const path = require('path')

const mime = require('mime-types')

const STATUS_CODES = require('./statusCodes')

function handleError (error) {
  console.log(error)
}

function handleSocket (socket) {
  socket.on('error', (error) => handleError(error))
  const send = socketWriter(socket)
  socket.on('data', (requestBuffer) => handleRequest(requestBuffer, send))
}

function parseRequestBuffer (buffer) {
  const request = {}

  const [requestAndHeaders, body] = buffer.toString().split('\r\n\r\n')
  const [methodLine, ...headers] = requestAndHeaders.split('\r\n')
  const [method, URI, protocol] = methodLine.split(' ')

  request.method = method
  request.uri = URI // TODO: parse params
  request.headers = parseHeaderArray(headers)
  request.body = body || undefined

  return request
}

function parseHeaderArray (headerArray) {
  const SEP = ': '
  const headers = {}

  for (const header of headerArray) {
    const [headerKey, headerValue] = header.split(SEP)
    headers[headerKey] = headerValue
  }
  return headers
}

const socketWriter = (socket) => {
  return function send (response) {
    let responseTemplate = 'HTTP/1.1 {{status}} {{message}}\r\n' +
                   '{{headers}}\r\n\r\n' + '{{content}}'

    const headers = Object.keys(response.headers)
      .map((header) => `${header}: ${response.headers[header]}`)
      .join('\r\n')

    responseTemplate = responseTemplate.replace('{{status}}', response.status)
    responseTemplate = responseTemplate.replace('{{message}}', STATUS_CODES[response.status])

    responseTemplate = responseTemplate.replace('{{headers}}', headers)
    responseTemplate = responseTemplate.replace('{{content}}', response.content)

    socket.write(responseTemplate)
  }
}

function populateResponse () {
  const response = {}

  response.Date = new Date().toUTCString()
  response.status = null
  response.headers = {}
  response.end = false

  return response
}

async function serveStatic (request, response, directory = 'public', lookup = 'index.html') {
  const file = path.join(directory,
    request.uri === '/' ? lookup : request.uri
  )

  try {
    const data = await fs.readFile(file)
    response.status = 200
    response.headers['Content-Type'] = mime.lookup(path.extname(file))
    response.headers['Content-Length'] = data.length
    response.headers.Connection = 'close'
    response.content = data
  } catch (error) {
    console.log(error)
    response.status = 404
    response.end = true
  }
}

async function handleRequest (buffer, send) {
  const request = parseRequestBuffer(buffer)
  const response = populateResponse()

  response.send = send
  await serveStatic(request, response, options.staticDir)
  send(response)
}

function HttpServer (options) {
  const server = net.createServer()
  server.on('connection', handleSocket)

  console.log('listening on', options.port)
  server.listen(options.port)
}

const options = {
  port: 8080,
  staticDir: 'public'
}

HttpServer(options)
