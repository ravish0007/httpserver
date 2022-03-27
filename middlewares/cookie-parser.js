
function cookieParser (request, response) {
  if (!request.headers.Cookie) {
    return
  }
  const cookies = {}

  for (const cookie of request.headers.Cookie.split('; ')) {
    const [key, value] = cookie.split('=')
    cookies[key] = value
  }

  request.cookies = cookies
}

export default cookieParser
