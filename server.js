import net from 'net'

import requestParser, { resetRequest } from './request.js'
import sendResponse, { newResponse } from './response.js'
import routeHandler from './route-handler.js'

import { sendStatus } from './utils.js'

import bodyParser from './middlewares/body-parser.js'
import cookieParser from './middlewares/cookie-parser.js'
import staticFiles from './middlewares/static-files.js'

const finalHandler = (request, response) => sendStatus(response, 404)

async function processRequest (request) {
  const response = newResponse()

  bodyParser(request, response)
  cookieParser(request, response)

  for (const handler of [staticFiles, routeHandler, finalHandler]) {
    await handler(request, response)

    if (response.isReady) {
      sendResponse(request, response)
      break
    }
  }

  resetRequest(request)
}

async function readRequest (chunk, request) {
  request.buffer = Buffer.concat([request.buffer, chunk])

  if (!request.headers) {
    requestParser(request)
  }

  try {
    if (request.method === 'POST') {
      const headerLength = request.buffer.indexOf('\r\n\r\n') + 4
      const bodyLength = request.buffer.length - headerLength

      if (bodyLength !== request.headers['Content-Length']) {
        return
      }
    }
    await processRequest(request)
  } catch (error) {
    console.log(error)
  }
}

function HttpServer (options) {
  const server = net.createServer((socket) => {
    const request = {
      socket: socket,
      buffer: Buffer.alloc(0)
    }

    socket.on('data', (chunk) => readRequest(chunk, request))
    socket.on('error', (error) => console.log(error))
  })

  console.log('listening on', options.port)
  server.listen(options.port)
}

export default HttpServer
