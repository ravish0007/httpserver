import path from 'path'
import fs from 'fs/promises'

import mime from 'mime-types'

async function staticFiles (request, response) {
  const file = path.join('public',
    request.path === '/' ? 'index.html' : request.path)

  if (request.method !== 'GET') {
    return
  }

  try {
    const data = await fs.readFile(file)
    response.status = 200
    response.headers['Content-Type'] = mime.lookup(path.extname(file))
    response.headers['Content-Length'] = data.length
    response.content = data
    response.isReady = true
  } catch (error) {
    console.log(error)
  }
}

export default staticFiles
