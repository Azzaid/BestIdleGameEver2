import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
const gameDataDir = path.resolve(process.env.GAME_DATA_DIR ?? path.join(__dirname, '..', 'src', 'data'))
const port = Number.parseInt(process.env.PORT ?? '4317', 10)
const entityCollections = new Set([
  'buildings',
  'enemies',
  'gunParts',
  'research',
  'wallSegments',
  'wallSuperstructures',
])

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
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
      'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
      'Access-Control-Allow-Origin': '*',
    })
    response.end()
    return
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { ok: true })
    return
  }

  if (request.method === 'POST' && url.pathname === '/entities') {
    let entity

    try {
      const body = await readRequestBody(request)
      entity = JSON.parse(body)
    } catch (error) {
      sendJson(response, 400, { error: 'Request body must be valid JSON' })
      return
    }

    const target = resolveEntityFile(entity)

    if (!target.ok) {
      sendJson(response, target.statusCode, { error: target.error })
      return
    }

    try {
      const fileContents = await readFile(target.filePath, 'utf8')
      const entities = JSON.parse(fileContents)

      if (!Array.isArray(entities)) {
        sendJson(response, 500, { error: 'Target data file must contain a JSON array' })
        return
      }

      const existingIndex = entities.findIndex(item => item?.id === entity.id)
      const action = existingIndex === -1 ? 'created' : 'updated'

      if (existingIndex === -1) {
        entities.push(entity)
      } else {
        entities[existingIndex] = entity
      }

      await writeFile(target.filePath, `${JSON.stringify(entities, null, 2)}\n`, 'utf8')
      sendJson(response, existingIndex === -1 ? 201 : 200, { action, entity, file: target.relativePath })
    } catch (error) {
      if (error.code === 'ENOENT') {
        sendJson(response, 404, { error: `Target data file not found for "${entity.id}"` })
        return
      }

      if (error instanceof SyntaxError) {
        sendJson(response, 500, { error: 'Target data file must contain valid JSON' })
        return
      }

      sendJson(response, 500, { error: 'Failed to add entity' })
    }
    return
  }

  if (request.method === 'POST' && (url.pathname === '/global-events' || url.pathname === '/global-modifiers')) {
    const targetFile = url.pathname === '/global-events'
      ? path.resolve(gameDataDir, 'globalEvents', 'events.json')
      : path.resolve(gameDataDir, 'globalModifiers', 'modifiers.json')

    const targetDir = path.dirname(targetFile)
    if (!targetFile.startsWith(`${targetDir}${path.sep}`)) {
      sendJson(response, 400, { error: 'Resolved global data path is outside the data directory' })
      return
    }

    let definition

    try {
      const body = await readRequestBody(request)
      definition = JSON.parse(body)
    } catch (error) {
      sendJson(response, 400, { error: 'Request body must be valid JSON' })
      return
    }

    if (!definition || Array.isArray(definition) || typeof definition !== 'object') {
      sendJson(response, 400, { error: 'Definition must be a JSON object' })
      return
    }

    if (typeof definition.id !== 'string' || !definition.id.trim()) {
      sendJson(response, 400, { error: 'Definition id must be a non-empty string' })
      return
    }

    try {
      const fileContents = await readFile(targetFile, 'utf8')
      const definitions = JSON.parse(fileContents)

      if (!Array.isArray(definitions)) {
        sendJson(response, 500, { error: 'Target data file must contain a JSON array' })
        return
      }

      const existingIndex = definitions.findIndex(item => item?.id === definition.id)
      const action = existingIndex === -1 ? 'created' : 'updated'

      if (existingIndex === -1) {
        definitions.push(definition)
      } else {
        definitions[existingIndex] = definition
      }

      await writeFile(targetFile, `${JSON.stringify(definitions, null, 2)}\n`, 'utf8')
      sendJson(response, existingIndex === -1 ? 201 : 200, {
        action,
        definition,
        file: path.relative(path.join(__dirname, '..'), targetFile).replaceAll(path.sep, '/'),
      })
    } catch (error) {
      if (error.code === 'ENOENT') {
        sendJson(response, 404, { error: 'Target global data file not found' })
        return
      }

      if (error instanceof SyntaxError) {
        sendJson(response, 500, { error: 'Target data file must contain valid JSON' })
        return
      }

      sendJson(response, 500, { error: 'Failed to save global definition' })
    }
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

function resolveEntityFile(entity) {
  if (!entity || Array.isArray(entity) || typeof entity !== 'object') {
    return { ok: false, statusCode: 400, error: 'Entity must be a JSON object' }
  }

  if (typeof entity.id !== 'string' || !entity.id.trim()) {
    return { ok: false, statusCode: 400, error: 'Entity id must be a non-empty string' }
  }

  const [collection, group, slot, itemName, ...extra] = entity.id.split('.')

  if (!entityCollections.has(collection)) {
    return { ok: false, statusCode: 400, error: `Unsupported entity collection "${collection}"` }
  }

  if (!group || !isSafePathPart(group)) {
    return { ok: false, statusCode: 400, error: 'Entity id must include a safe group segment' }
  }

  if (collection === 'gunParts') {
    if (!slot || !itemName || extra.length || !isSafePathPart(slot) || !isSafePathPart(itemName)) {
      return { ok: false, statusCode: 400, error: 'Gun part ids must use gunParts.{vector}.{slot}.{item}' }
    }
  } else if (!slot || extra.length || !isSafePathPart(slot)) {
    return { ok: false, statusCode: 400, error: `${collection} ids must use ${collection}.{group}.{item}` }
  }

  const filePath = path.resolve(gameDataDir, collection, `${group}.json`)
  const collectionDir = path.resolve(gameDataDir, collection)

  if (!filePath.startsWith(`${collectionDir}${path.sep}`)) {
    return { ok: false, statusCode: 400, error: 'Resolved entity path is outside the data directory' }
  }

  return {
    ok: true,
    filePath,
    relativePath: path.relative(path.join(__dirname, '..'), filePath).replaceAll(path.sep, '/'),
  }
}

function isSafePathPart(value) {
  return /^[A-Za-z0-9_-]+$/.test(value)
}
