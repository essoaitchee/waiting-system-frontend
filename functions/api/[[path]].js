export async function onRequest(context) {
  const { request, env, params } = context
  const incomingUrl = new URL(request.url)
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path || ''
  const targetUrl = new URL(`/api/${path}`, origin)

  targetUrl.search = incomingUrl.search

  if (path === '__debug/upstream') {
    return Response.json({
      apiOrigin: origin,
      targetUrl: targetUrl.toString(),
      requestMethod: request.method,
    })
  }

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('origin')
  headers.delete('access-control-request-method')
  headers.delete('access-control-request-headers')

  const upstream = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  })

  const responseHeaders = new Headers(upstream.headers)
  responseHeaders.set('x-proxy-api-origin', origin)
  responseHeaders.set('x-proxy-target-url', targetUrl.origin)

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}
