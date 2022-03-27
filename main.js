import HttpServer from './server.js'
import { sendHTML, sendJSON, sendStatus, redirect, setCookie } from './utils.js'
import { addRoute } from './route-handler.js'

const data = { notes: [] }

addRoute('get', '/foo', (request, response) => {
  setCookie(response, 'hello', 'world')
  setCookie(response, 'foo', 'world')
  sendHTML(response, 'Now visit /bar')
})

addRoute('get', '/bar', (request, response) => {
  const html = 'First visit /foo'

  if (request.cookies) {
    sendJSON(response, request.cookies)
    return
  }

  sendHTML(response, html)
})

addRoute('get', '/displayNotes', (request, response) => {
  const noteList = []

  data.notes.forEach(({ name, note }) => {
    noteList.push(`<p> ${name}: ${note}</p>`)
  })

  sendHTML(response, noteList.join('\n'))
})

addRoute('get', '/notes', (request, response) => {
  sendJSON(response, data)
})

addRoute('post', '/notes', (request, response) => {
  if (request.body && request.body.note) {
    data.notes.push({
      name: request.body.name,
      note: request.body.note
    })

    if (request.headers['Content-Type'] === 'application/json') {
      sendStatus(response, 201, 'Note Created')
      return
    }
    redirect(response, '/displayNotes.html')
  } else {
    sendStatus(response, 400, 'Note Not Found ')
  }
})

const options = { port: 8080 }
HttpServer(options)
