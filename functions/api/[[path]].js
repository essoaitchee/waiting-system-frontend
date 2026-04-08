export async function onRequest(context) {
  const { request, env, params } = context
  const incomingUrl = new URL(request.url)
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path || ''
  const origin = env.API_ORIGIN || 'http://localhost:8081'
  const targetUrl = new URL(`/api/${path}`, origin)

  targetUrl.search = incomingUrl.search

  const headers = new Headers(request.headers)
  headers.delete('host')

  const upstream = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  })
}
