import mime from 'mime-types'

import STATUS_CODES from './statusCodes.js'

function sendJSON (response, object) {
  response.content = JSON.stringify(object)
  response.status = 200
  response.headers['Content-Length'] = response.content.length
  response.headers['Content-Type'] = mime.lookup('json')
}

function sendHTML (response, text) {
  response.content = text
  response.status = 200
  response.headers['Content-Length'] = response.content.length
  response.headers['Content-Type'] = mime.lookup('html')
}

function sendStatus (response, code, message) {
  response.status = code
  response.message = message || STATUS_CODES[code]
  response.isReady = true
  response.headers.Connection = 'close'
}

function redirect (response, location) {
  response.status = 302
  response.message = STATUS_CODES[302]
  response.isReady = true
  response.headers.Location = location
  response.headers.Connection = 'close'
}

function setCookie (response, key, value) {
  if (!response.headers['Set-Cookie']) {
    response.headers['Set-Cookie'] = `${key}=${value}; Secure`
  }
}

export {
  sendJSON,
  sendHTML,
  sendStatus,
  redirect,
  setCookie
}
