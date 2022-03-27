import STATUS_CODES from './statusCodes.js'

export function newResponse () {
  const response = {}

  response.Date = new Date().toUTCString()
  response.status = null
  response.isReady = false
  response.headers = {}

  return response
}

function sendResponse (request, response) {
  const socket = request.socket

  let responseString = 'HTTP/1.1 {{status}} {{message}}\r\n' +
                   '{{headers}}\r\n\r\n'

  const headers = Object.keys(response.headers)
    .map((header) => `${header}: ${response.headers[header]}`)
    .join('\r\n')

  responseString = responseString.replace('{{status}}', response.status)
  responseString = responseString.replace('{{message}}', request.message || STATUS_CODES[response.status])
  responseString = responseString.replace('{{headers}}', headers)

  let responseBuffer = Buffer.from(responseString)

  if (response.content) {
    response.content = Buffer.from(response.content)
    responseBuffer = Buffer.concat([responseBuffer, response.content])
  }

  socket.write(responseBuffer)

  if (response.headers.Connection === 'close' ||
    request.headers.Connection !== 'keep-alive') {
    socket.end()
  }
}

export default sendResponse
