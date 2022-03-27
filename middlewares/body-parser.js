import { sendStatus } from '../utils.js'

function multipartFormParser (body, boundary) {
  const formData = {}

  body.toString().split(boundary).forEach(line => {
    const result = /name="(.*)"\r\n\r\n(.*)\r\n/.exec(line)

    if (result) {
      formData[result[1]] = result[2]
    }
  })

  return formData
}

function bodyParser (request, response) {
  if (request.method !== 'POST') {
    return
  }

  const bodyBegin = request.buffer.indexOf('\r\n\r\n') + 4
  const body = request.buffer.slice(bodyBegin)

  const contentType = request.headers['Content-Type']

  if (contentType.startsWith('multipart/form-data')) {
    const boundary = '--' + contentType.split('boundary=')[1]
    request.body = multipartFormParser(body, boundary)
  } else if (contentType === 'application/json') {
    request.body = JSON.parse(body)
  } else {
    sendStatus(response, 501)
  }
}

export default bodyParser
