import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
const port = Number.parseInt(process.env.PORT ?? '4317', 10)

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(`${JSON.stringify(body, null, 2)}\n`)
}

const readRequestBody = async (request) => {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks).toString('utf8')
}

const resolveGameFile = (fileName) => {
  if (!fileName || fileName.includes('/') || fileName.includes('\\') || !fileName.endsWith('.json')) {
    return null
  }

  const resolvedPath = path.resolve(dataDir, fileName)

  if (!resolvedPath.startsWith(`${path.resolve(dataDir)}${path.sep}`)) {
    return null
  }

  return resolvedPath
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
      'Access-Control-Allow-Origin': '*',
    })
    response.end()
    return
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { ok: true })
    return
  }

  const fileMatch = url.pathname.match(/^\/game-files\/([^/]+)$/)

  if (!fileMatch) {
    sendJson(response, 404, { error: 'Not found' })
    return
  }

  const filePath = resolveGameFile(decodeURIComponent(fileMatch[1]))

  if (!filePath) {
    sendJson(response, 400, { error: 'Only JSON files in the local data folder are supported' })
    return
  }

  if (request.method === 'GET') {
    try {
      const fileContents = await readFile(filePath, 'utf8')
      sendJson(response, 200, JSON.parse(fileContents))
    } catch (error) {
      sendJson(response, 404, { error: 'Game file not found' })
    }
    return
  }

  if (request.method === 'PUT') {
    try {
      const body = await readRequestBody(request)
      const parsedBody = JSON.parse(body)
      await writeFile(filePath, `${JSON.stringify(parsedBody, null, 2)}\n`, 'utf8')
      sendJson(response, 200, parsedBody)
    } catch (error) {
      sendJson(response, 400, { error: 'Request body must be valid JSON' })
    }
    return
  }

  sendJson(response, 405, { error: 'Method not allowed' })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Local game data server listening on http://127.0.0.1:${port}`)
})
