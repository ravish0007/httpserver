
function headerParser (headerChunk) {
  const headers = {}
  const SEP = ': '

  for (const header of headerChunk.toString().split('\r\n')) {
    const [key, value] = header.split(SEP)
    headers[key] = value
  }

  if (headers['Content-Length']) {
    headers['Content-Length'] = Number(headers['Content-Length'])
  }

  return headers
}

function queryParser (uri) {
  let path = uri
  const params = {}

  if (uri.includes('?')) {
    const [tempPath, tempParams] = uri.split('?')
    path = tempPath

    for (const pair of tempParams.split('&')) {
      const [key, value] = pair.split('=')
      params[key] = value
    }
  }

  return [path, params]
}

function methodParser (methodChunk) {
  const [method, URI, protocolVersion] = methodChunk.toString().split(' ')
  return [method, URI, protocolVersion]
}

function requestParser (request) {
  const headerEnd = request.buffer.indexOf('\r\n\r\n')

  if (headerEnd > -1) {
    const methodLineEnd = request.buffer.indexOf('\r\n')
    const methodLineChunk = request.buffer.slice(0, methodLineEnd)

    const headerChunk = request.buffer.slice(methodLineEnd + 2, headerEnd);

    [request.method, request.uri, request.protocol] = methodParser(methodLineChunk);
    [request.path, request.query] = queryParser(request.uri)
    request.headers = headerParser(headerChunk)
  }
}

export function resetRequest (request) {
  request.headers = null
  request.query = null
  request.body = null
  request.buffer = Buffer.alloc(0)
}

export default requestParser
