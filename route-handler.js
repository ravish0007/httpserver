
const routes = {}

export default function routeHandler (request, response) {
  const method = request.method.toUpperCase()

  try {
    routes[method][request.path](request, response)
    response.isReady = true
  } catch (error) {
    console.log(error)
  }
}

export function addRoute (method, path, func) {
  method = method.toUpperCase()

  if (!routes[method]) {
    routes[method] = {}
  }

  routes[method][path] = func
}
