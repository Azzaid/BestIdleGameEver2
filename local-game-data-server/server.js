import { createServer } from 'node:http'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
const gameDataDir = path.resolve(process.env.GAME_DATA_DIR ?? path.join(__dirname, '..', 'src', 'data'))
const gameAssetsDir = path.resolve(process.env.GAME_ASSETS_DIR ?? path.join(gameDataDir, '..', 'assets'))
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
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
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

const readRequestBuffer = async (request) => {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

const readMultipartFormData = async (request) => {
  const contentType = request.headers['content-type'] ?? ''
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)

  if (!boundaryMatch) {
    const error = new Error('Multipart upload must include a boundary')
    error.statusCode = 400
    throw error
  }

  const boundary = boundaryMatch[1] ?? boundaryMatch[2]
  const body = await readRequestBuffer(request)
  const boundaryBuffer = Buffer.from(`--${boundary}`)
  const fields = {}
  const files = {}
  let cursor = 0

  while (cursor < body.length) {
    const boundaryStart = body.indexOf(boundaryBuffer, cursor)
    if (boundaryStart === -1) break

    const partStart = boundaryStart + boundaryBuffer.length
    if (body.subarray(partStart, partStart + 2).toString('utf8') === '--') break

    const headerStart = partStart + 2
    const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), headerStart)
    if (headerEnd === -1) break

    const headerText = body.subarray(headerStart, headerEnd).toString('utf8')
    const contentStart = headerEnd + 4
    const nextBoundary = body.indexOf(boundaryBuffer, contentStart)
    if (nextBoundary === -1) break

    const contentEnd = body.subarray(nextBoundary - 2, nextBoundary).toString('utf8') === '\r\n'
      ? nextBoundary - 2
      : nextBoundary
    const content = body.subarray(contentStart, contentEnd)
    const name = headerText.match(/name="([^"]+)"/i)?.[1]
    const filename = headerText.match(/filename="([^"]*)"/i)?.[1]
    const partContentType = headerText.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim()

    if (name) {
      if (filename !== undefined) {
        files[name] = {
          filename,
          contentType: partContentType,
          buffer: content,
        }
      } else {
        fields[name] = content.toString('utf8')
      }
    }

    cursor = nextBoundary
  }

  return { fields, files }
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
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
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
      const payload = JSON.parse(body)
      entity = payload?.entity ?? payload
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
      sendJson(response, existingIndex === -1 ? 201 : 200, {
        action,
        entity,
        file: target.relativePath,
      })
    } catch (error) {
      if (error.code === 'ENOENT') {
        sendJson(response, 404, { error: `Target data file not found for "${entity.id}"` })
        return
      }

      if (error instanceof SyntaxError) {
        sendJson(response, 500, { error: 'Target data file must contain valid JSON' })
        return
      }

      sendJson(response, error.statusCode ?? 500, { error: error.message ?? 'Failed to add entity' })
    }
    return
  }

  if (request.method === 'POST' && url.pathname === '/entity-sprites') {
    try {
      const upload = await readMultipartFormData(request)
      const spriteResult = await saveSpriteUpload(upload.fields, upload.files.image)
      sendJson(response, 200, spriteResult)
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, { error: error.message ?? 'Failed to save sprite' })
    }
    return
  }

  if (request.method === 'POST' && url.pathname === '/entity-sprite-metadata') {
    let payload

    try {
      const body = await readRequestBody(request)
      payload = JSON.parse(body)
    } catch (error) {
      sendJson(response, 400, { error: 'Request body must be valid JSON' })
      return
    }

    const target = resolveSpriteTarget(payload, payload?.fileStem)

    if (!target.ok || !target.metadataPath) {
      sendJson(response, target.statusCode ?? 400, { error: target.error ?? 'Could not resolve metadata file' })
      return
    }

    if (!payload?.metadata || Array.isArray(payload.metadata) || typeof payload.metadata !== 'object') {
      sendJson(response, 400, { error: 'Sprite metadata must be a JSON object' })
      return
    }

    try {
      await mkdir(target.dir, { recursive: true })
      await writeSpriteMetadata(target.metadataPath, payload.metadata)
      sendJson(response, 200, {
        action: 'saved',
        file: target.relativeMetadataPath,
      })
    } catch (error) {
      sendJson(response, 500, { error: 'Failed to save sprite metadata' })
    }
    return
  }

  if (request.method === 'DELETE' && url.pathname === '/entity-sprites') {
    try {
      const body = await readRequestBody(request)
      const action = JSON.parse(body)
      const spriteResult = await deleteSpriteAction(action)
      sendJson(response, 200, spriteResult)
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, { error: error.message ?? 'Failed to delete sprite' })
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
      const payload = JSON.parse(body)
      definition = payload?.definition ?? payload
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

  if (request.method === 'POST' && url.pathname === '/homogeneous-values') {
    let definition

    try {
      const body = await readRequestBody(request)
      const payload = JSON.parse(body)
      definition = payload?.definition ?? payload
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

    const targetFile = path.resolve(gameDataDir, 'homogeneousValues', 'index.ts')

    try {
      const source = await readFile(targetFile, 'utf8')
      const nextSource = updateHomogeneousValueDefinitionSource(source, definition)
      await writeFile(targetFile, nextSource, 'utf8')
      sendJson(response, 200, {
        action: 'updated',
        definition,
        file: path.relative(path.join(__dirname, '..'), targetFile).replaceAll(path.sep, '/'),
      })
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, { error: error.message ?? 'Failed to save homogeneous value definition' })
    }
    return
  }

  if (request.method === 'POST' && url.pathname === '/battle-damage-area-vfx') {
    let definition

    try {
      const body = await readRequestBody(request)
      const payload = JSON.parse(body)
      definition = payload?.definition ?? payload
    } catch (error) {
      sendJson(response, 400, { error: 'Request body must be valid JSON' })
      return
    }

    const validation = validateBattleDamageAreaVfxDefinition(definition)
    if (!validation.ok) {
      sendJson(response, validation.statusCode, { error: validation.error })
      return
    }

    const targetFile = path.resolve(gameDataDir, 'battleDamageAreaVfxDefinitions.json')

    try {
      const fileContents = await readFile(targetFile, 'utf8')
      const definitions = JSON.parse(fileContents)

      if (!Array.isArray(definitions)) {
        sendJson(response, 500, { error: 'Battle damage-area VFX file must contain a JSON array' })
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
        sendJson(response, 404, { error: 'Battle damage-area VFX data file not found' })
        return
      }

      if (error instanceof SyntaxError) {
        sendJson(response, 500, { error: 'Battle damage-area VFX file must contain valid JSON' })
        return
      }

      sendJson(response, 500, { error: 'Failed to save battle damage-area VFX definition' })
    }
    return
  }

  if (request.method === 'POST' && url.pathname === '/global-event-images') {
    try {
      const upload = await readMultipartFormData(request)
      const imageResult = await saveGlobalEventImageUpload(upload.fields, upload.files.image)
      sendJson(response, 200, imageResult)
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, { error: error.message ?? 'Failed to save event image' })
    }
    return
  }

  if (request.method === 'DELETE' && url.pathname === '/global-event-images') {
    try {
      const body = await readRequestBody(request)
      const action = JSON.parse(body)
      const imageResult = await deleteGlobalEventImageAction(action)
      sendJson(response, 200, imageResult)
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, { error: error.message ?? 'Failed to delete event image' })
    }
    return
  }

  if (request.method === 'POST' && url.pathname === '/hex-background-sprites') {
    try {
      const upload = await readMultipartFormData(request)
      const imageResult = await saveHexBackgroundSpriteUpload(upload.fields, upload.files.image)
      sendJson(response, 200, imageResult)
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, { error: error.message ?? 'Failed to save hex background sprite' })
    }
    return
  }

  if (request.method === 'POST' && url.pathname === '/battle-effect-sprites') {
    try {
      const upload = await readMultipartFormData(request)
      const imageResult = await saveBattleEffectSpriteUpload(upload.fields, upload.files.image)
      sendJson(response, 200, imageResult)
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, { error: error.message ?? 'Failed to save battle effect sprite' })
    }
    return
  }

  if (request.method === 'POST' && url.pathname === '/enemy-animation-sprites') {
    try {
      const upload = await readMultipartFormData(request)
      const imageResult = await saveEnemyAnimationSpriteUpload(upload.fields, upload.files.image)
      sendJson(response, 200, imageResult)
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, { error: error.message ?? 'Failed to save enemy animation sprite' })
    }
    return
  }

  if (request.method === 'POST' && url.pathname === '/gun-part-metadata') {
    let payload

    try {
      const body = await readRequestBody(request)
      payload = JSON.parse(body)
    } catch (error) {
      sendJson(response, 400, { error: 'Request body must be valid JSON' })
      return
    }

    const target = resolveSpriteTarget({
      kind: 'gunPart',
      vector: payload?.vector,
    }, payload?.fileStem)

    if (!target.ok || !target.metadataPath) {
      sendJson(response, target.statusCode ?? 400, { error: target.error ?? 'Could not resolve metadata file' })
      return
    }

    if (!payload?.metadata || Array.isArray(payload.metadata) || typeof payload.metadata !== 'object') {
      sendJson(response, 400, { error: 'Metadata must be a JSON object' })
      return
    }

    try {
      await mkdir(target.dir, { recursive: true })
      await writeFile(target.metadataPath, `${JSON.stringify(payload.metadata, null, 2)}\n`, 'utf8')
      sendJson(response, 200, {
        action: 'saved',
        file: target.relativeMetadataPath,
      })
    } catch (error) {
      sendJson(response, 500, { error: 'Failed to save gun part metadata' })
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

function updateHomogeneousValueDefinitionSource(source, definition) {
  const startMarker = 'export const HOMOGENEOUS_VALUE_DEFINITIONS = {'
  const endMarker = '} as const satisfies Record<HomogeneousValueId, HomogeneousValueDefinition>;'
  const startIndex = source.indexOf(startMarker)
  const endIndex = source.indexOf(endMarker, startIndex)

  if (startIndex === -1 || endIndex === -1) {
    const error = new Error('Could not find HOMOGENEOUS_VALUE_DEFINITIONS in homogeneousValues/index.ts')
    error.statusCode = 500
    throw error
  }

  const bodyStart = startIndex + startMarker.length
  const body = source.slice(bodyStart, endIndex)
  const idConstants = getHomogeneousValueIdConstants(source)
  const entry = findHomogeneousValueDefinitionEntry(body, definition.id, idConstants)

  if (!entry) {
    const error = new Error(`Homogeneous value "${definition.id}" was not found. Create the id constant manually before editing it here.`)
    error.statusCode = 404
    throw error
  }

  const formattedEntry = formatHomogeneousValueDefinition(entry.key, definition)

  return [
    source.slice(0, bodyStart + entry.start),
    formattedEntry,
    source.slice(bodyStart + entry.end),
  ].join('')
}

function getHomogeneousValueIdConstants(source) {
  const startMarker = 'export const HOMOGENEOUS_VALUE_IDS = {'
  const endMarker = '} as const satisfies Record<string, HomogeneousValueId>;'
  const startIndex = source.indexOf(startMarker)
  const endIndex = source.indexOf(endMarker, startIndex)
  const constants = new Map()

  if (startIndex === -1 || endIndex === -1) return constants

  const body = source.slice(startIndex + startMarker.length, endIndex)
  const idPattern = /^\s*([A-Za-z_$][\w$]*)\s*:\s*"([^"]+)"/gm
  let match

  while ((match = idPattern.exec(body)) !== null) {
    constants.set(match[1], match[2])
  }

  return constants
}

function findHomogeneousValueDefinitionEntry(body, id, idConstants) {
  let cursor = 0

  while (cursor < body.length) {
    while (cursor < body.length && /[\s,]/.test(body[cursor])) cursor += 1
    if (cursor >= body.length) return null

    const entryStart = findLineIndentStart(body, cursor)
    const keyEnd = findTopLevelKeyEnd(body, cursor)
    if (keyEnd === -1) return null

    const key = body.slice(cursor, keyEnd).trim()
    cursor = keyEnd + 1
    while (cursor < body.length && /\s/.test(body[cursor])) cursor += 1

    if (body[cursor] !== '{') return null

    const objectEnd = findMatchingBrace(body, cursor)
    if (objectEnd === -1) return null

    cursor = objectEnd + 1
    while (cursor < body.length && /\s/.test(body[cursor])) cursor += 1
    if (body[cursor] === ',') cursor += 1

    const entryEnd = cursor
    if (resolveHomogeneousValueDefinitionKey(key, idConstants) === id) {
      return {
        start: entryStart,
        end: entryEnd,
        key,
      }
    }
  }

  return null
}

function findLineIndentStart(source, cursor) {
  const lineStart = source.lastIndexOf('\n', cursor - 1) + 1
  return lineStart >= 0 ? lineStart : cursor
}

function findTopLevelKeyEnd(source, start) {
  let bracketDepth = 0
  let quote = ''

  for (let index = start; index < source.length; index += 1) {
    const character = source[index]
    const previous = source[index - 1]

    if (quote) {
      if (character === quote && previous !== '\\') quote = ''
      continue
    }

    if (character === '"' || character === "'") {
      quote = character
      continue
    }

    if (character === '[') bracketDepth += 1
    if (character === ']') bracketDepth -= 1
    if (character === ':' && bracketDepth === 0) return index
  }

  return -1
}

function findMatchingBrace(source, start) {
  let depth = 0
  let quote = ''

  for (let index = start; index < source.length; index += 1) {
    const character = source[index]
    const previous = source[index - 1]

    if (quote) {
      if (character === quote && previous !== '\\') quote = ''
      continue
    }

    if (character === '"' || character === "'") {
      quote = character
      continue
    }

    if (character === '{') depth += 1
    if (character === '}') {
      depth -= 1
      if (depth === 0) return index
    }
  }

  return -1
}

function resolveHomogeneousValueDefinitionKey(key, idConstants) {
  const constantKey = key.match(/^\[HOMOGENEOUS_VALUE_IDS\.([A-Za-z_$][\w$]*)\]$/)?.[1]
  if (constantKey) return idConstants.get(constantKey)

  return key.match(/^"([^"]+)"$/)?.[1]
}

function formatHomogeneousValueDefinition(key, definition) {
  const lines = [
    `    ${key}: {`,
    `        id: ${key.startsWith('[HOMOGENEOUS_VALUE_IDS.') ? key.slice(1, -1) : JSON.stringify(definition.id)},`,
    `        label: ${JSON.stringify(definition.label ?? definition.id)},`,
    `        keywords: ${JSON.stringify(Array.isArray(definition.keywords) ? definition.keywords : [])},`,
    `        displayMethod: ${JSON.stringify(definition.displayMethod ?? 'default')},`,
  ]

  if (definition.resolutionMethod && definition.resolutionMethod !== 'sum') {
    lines.push(`        resolutionMethod: ${JSON.stringify(definition.resolutionMethod)},`)
  }

  if (definition.resolutionMethod === 'diminishingReturn') {
    lines.push(`        diminishingReturnPower: ${formatNumber(definition.diminishingReturnPower ?? 1)},`)
  }

  if (definition.roundingMethod && definition.roundingMethod !== 'twoDigitsAfterZero') {
    lines.push(`        roundingMethod: ${JSON.stringify(definition.roundingMethod)},`)
  }

  lines.push(`        initialValue: ${formatNumber(definition.initialValue ?? 0)},`)
  lines.push('    },')

  return lines.join('\n')
}

function formatNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? String(number) : '0'
}

async function saveSpriteUpload(fields, imageFile) {
  const action = {
    kind: fields.kind,
    vector: fields.vector,
    slot: fields.slot || undefined,
    assetId: fields.assetId,
    fileStem: fields.fileStem,
    previousFileStem: fields.previousFileStem || undefined,
    metadata: fields.metadata ? JSON.parse(fields.metadata) : undefined,
  }
  const target = resolveSpriteTarget(action, action?.fileStem)

  if (!target.ok) {
    const error = new Error(target.error)
    error.statusCode = target.statusCode
    throw error
  }

  if (!imageFile?.buffer?.length || imageFile.contentType !== 'image/png') {
    throw new Error('Sprite upload must include a PNG image')
  }

  await mkdir(target.dir, { recursive: true })

  await writeFile(target.imagePath, imageFile.buffer)

  if (target.metadataPath) {
    if (!action.metadata || Array.isArray(action.metadata) || typeof action.metadata !== 'object') {
      throw new Error('Sprite metadata is required for this entity type')
    }

    await writeFile(target.metadataPath, `${JSON.stringify(action.metadata, null, 2)}\n`, 'utf8')
  }

  if (action.previousFileStem && action.previousFileStem !== action.fileStem) {
    const previousTarget = resolveSpriteTarget(action, action.previousFileStem)
    if (previousTarget.ok) {
      await deleteSpriteFiles(previousTarget)
    }
  }

  return {
    action: 'saved',
    file: target.relativeImagePath,
    metadataFile: target.relativeMetadataPath,
  }
}

async function writeSpriteMetadata(metadataPath, metadata) {
  const existingMetadataFile = await readJsonFileIfExists(metadataPath)
  const metadataFile = isPixiSpritesheetJson(existingMetadataFile)
    ? {
      ...existingMetadataFile,
      meta: {
        ...existingMetadataFile.meta,
        enemyVisualMetadata: {
          ...(isRecord(existingMetadataFile.meta.enemyVisualMetadata) ? existingMetadataFile.meta.enemyVisualMetadata : {}),
          ...metadata,
        },
      },
    }
    : metadata

  await writeFile(metadataPath, `${JSON.stringify(metadataFile, null, 2)}\n`, 'utf8')
}

async function readJsonFileIfExists(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return undefined
    return undefined
  }
}

function isPixiSpritesheetJson(value) {
  return isRecord(value) && isRecord(value.frames) && isRecord(value.meta)
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

async function deleteSpriteAction(action) {
  const target = resolveSpriteTarget(action, action?.fileStem)

  if (!target.ok) {
    const error = new Error(target.error)
    error.statusCode = target.statusCode
    throw error
  }

  await deleteSpriteFiles(target)
  return {
    action: 'removed',
    file: target.relativeImagePath,
  }
}

async function deleteSpriteFiles(target) {
  await rm(target.imagePath, { force: true })

  if (target.metadataPath) {
    await rm(target.metadataPath, { force: true })
  }
}

function resolveSpriteTarget(action, fileStem) {
  if (!action || Array.isArray(action) || typeof action !== 'object') {
    return { ok: false, statusCode: 400, error: 'Sprite action must be a JSON object' }
  }

  const dir = resolveSpriteDir(action.kind, action.vector)

  if (!dir) {
    return { ok: false, statusCode: 400, error: 'Sprite action must include a supported kind and vector' }
  }

  if (!fileStem || !isSafePathPart(fileStem)) {
    return { ok: false, statusCode: 400, error: 'Sprite file stem must be a safe path segment' }
  }

  const imagePath = path.resolve(dir, `${fileStem}.png`)
  const metadataPath = action.kind === 'projectile'
    ? undefined
    : path.resolve(dir, `${fileStem}.json`)

  if (!imagePath.startsWith(`${dir}${path.sep}`) || (metadataPath && !metadataPath.startsWith(`${dir}${path.sep}`))) {
    return { ok: false, statusCode: 400, error: 'Resolved sprite path is outside the asset directory' }
  }

  return {
    ok: true,
    dir,
    imagePath,
    metadataPath,
    relativeImagePath: path.relative(path.join(__dirname, '..'), imagePath).replaceAll(path.sep, '/'),
    relativeMetadataPath: metadataPath ? path.relative(path.join(__dirname, '..'), metadataPath).replaceAll(path.sep, '/') : undefined,
  }
}

function resolveSpriteDir(kind, vector) {
  if (!isSafePathPart(vector)) return null

  const collection = {
    building: 'buildings',
    enemy: 'enemies',
    wallSegment: 'wallSegments',
    wallSuperstructure: 'wallSuperstructures',
    gunPart: 'gunParts',
    projectile: 'projectiles',
  }[kind]

  if (!collection) return null

  const dir = path.resolve(gameAssetsDir, collection, vector)
  const collectionDir = path.resolve(gameAssetsDir, collection)

  if (!dir.startsWith(`${collectionDir}${path.sep}`)) return null

  return dir
}

async function saveGlobalEventImageUpload(fields, imageFile) {
  const action = {
    fileStem: fields.fileStem,
    previousFileStem: fields.previousFileStem || undefined,
  }
  const target = resolveGlobalEventImageTarget(action?.fileStem)

  if (!target.ok) {
    const error = new Error(target.error)
    error.statusCode = target.statusCode
    throw error
  }

  if (!imageFile?.buffer?.length || imageFile.contentType !== 'image/png') {
    throw new Error('Event image upload must include a PNG image')
  }

  await mkdir(target.dir, { recursive: true })
  await writeFile(target.imagePath, imageFile.buffer)

  if (action.previousFileStem && action.previousFileStem !== action.fileStem) {
    const previousTarget = resolveGlobalEventImageTarget(action.previousFileStem)
    if (previousTarget.ok) {
      await rm(previousTarget.imagePath, { force: true })
    }
  }

  return {
    action: 'saved',
    file: target.relativeImagePath,
  }
}

async function deleteGlobalEventImageAction(action) {
  const target = resolveGlobalEventImageTarget(action?.fileStem)

  if (!target.ok) {
    const error = new Error(target.error)
    error.statusCode = target.statusCode
    throw error
  }

  await rm(target.imagePath, { force: true })
  return {
    action: 'removed',
    file: target.relativeImagePath,
  }
}

function resolveGlobalEventImageTarget(fileStem) {
  const dir = path.resolve(gameAssetsDir, 'events')

  if (!fileStem || !isSafePathPart(fileStem)) {
    return { ok: false, statusCode: 400, error: 'Event image file stem must be a safe path segment' }
  }

  const imagePath = path.resolve(dir, `${fileStem}.png`)

  if (!imagePath.startsWith(`${dir}${path.sep}`)) {
    return { ok: false, statusCode: 400, error: 'Resolved event image path is outside the asset directory' }
  }

  return {
    ok: true,
    dir,
    imagePath,
    relativeImagePath: path.relative(path.join(__dirname, '..'), imagePath).replaceAll(path.sep, '/'),
  }
}

async function saveHexBackgroundSpriteUpload(fields, imageFile) {
  const action = {
    type: fields.type,
    biome: fields.biome,
    vector: fields.vector,
    fileStem: fields.fileStem,
  }
  const target = resolveHexBackgroundSpriteTarget(action)

  if (!target.ok) {
    const error = new Error(target.error)
    error.statusCode = target.statusCode
    throw error
  }

  if (!imageFile?.buffer?.length || imageFile.contentType !== 'image/png') {
    throw new Error('Hex background upload must include a PNG image')
  }

  await mkdir(target.dir, { recursive: true })
  await writeFile(target.imagePath, imageFile.buffer)

  return {
    action: 'saved',
    file: target.relativeImagePath,
  }
}

function resolveHexBackgroundSpriteTarget(action) {
  const types = new Set(['claimedTerrain', 'buildingUnderlay', 'claimableTerrain', 'unclaimableTerrain'])
  const biomes = new Set(['alpine', 'floodplain', 'swamp', 'steppe', 'rocky', 'volcanic', 'coastal', 'tundra', 'ancientForest'])
  const vectors = new Set(['tech', 'nature', 'medieval', 'aether'])

  if (!types.has(action?.type)) {
    return { ok: false, statusCode: 400, error: 'Hex background type is not supported' }
  }

  if (!biomes.has(action?.biome)) {
    return { ok: false, statusCode: 400, error: 'Hex background biome is not supported' }
  }

  if (!vectors.has(action?.vector)) {
    return { ok: false, statusCode: 400, error: 'Hex background vector is not supported' }
  }

  if (!action?.fileStem || !isSafePathPart(action.fileStem)) {
    return { ok: false, statusCode: 400, error: 'Hex background file stem must be a safe path segment' }
  }

  const collectionDir = path.resolve(gameAssetsDir, 'hexBackgrounds')
  const dir = path.resolve(collectionDir, action.type, action.biome, action.vector)
  const imagePath = path.resolve(dir, `${action.fileStem}.png`)

  if (!dir.startsWith(`${collectionDir}${path.sep}`) || !imagePath.startsWith(`${dir}${path.sep}`)) {
    return { ok: false, statusCode: 400, error: 'Resolved hex background path is outside the asset directory' }
  }

  return {
    ok: true,
    dir,
    imagePath,
    relativeImagePath: path.relative(path.join(__dirname, '..'), imagePath).replaceAll(path.sep, '/'),
  }
}

async function saveBattleEffectSpriteUpload(fields, imageFile) {
  const action = {
    fileStem: fields.fileStem,
  }
  const target = resolveBattleEffectSpriteTarget(action)

  if (!target.ok) {
    const error = new Error(target.error)
    error.statusCode = target.statusCode
    throw error
  }

  if (!imageFile?.buffer?.length || imageFile.contentType !== 'image/png') {
    throw new Error('Battle effect upload must include a PNG image')
  }

  await mkdir(target.dir, { recursive: true })
  await writeFile(target.imagePath, imageFile.buffer)

  return {
    action: 'saved',
    file: target.relativeImagePath,
  }
}

function resolveBattleEffectSpriteTarget(action) {
  if (!action?.fileStem || !isSafePathPart(action.fileStem)) {
    return { ok: false, statusCode: 400, error: 'Battle effect file stem must be a safe path segment' }
  }

  const dir = path.resolve(gameAssetsDir, 'battle', 'effects')
  const collectionDir = path.resolve(gameAssetsDir, 'battle')
  const imagePath = path.resolve(dir, `${action.fileStem}.png`)

  if (!dir.startsWith(`${collectionDir}${path.sep}`) || !imagePath.startsWith(`${dir}${path.sep}`)) {
    return { ok: false, statusCode: 400, error: 'Resolved battle effect path is outside the asset directory' }
  }

  return {
    ok: true,
    dir,
    imagePath,
    relativeImagePath: path.relative(path.join(__dirname, '..'), imagePath).replaceAll(path.sep, '/'),
  }
}

function validateBattleDamageAreaVfxDefinition(definition) {
  if (!definition || Array.isArray(definition) || typeof definition !== 'object') {
    return { ok: false, statusCode: 400, error: 'Definition must be a JSON object' }
  }

  if (typeof definition.id !== 'string' || !definition.id.trim()) {
    return { ok: false, statusCode: 400, error: 'Definition id must be a non-empty string' }
  }

  if (typeof definition.label !== 'string' || !definition.label.trim()) {
    return { ok: false, statusCode: 400, error: 'Definition label must be a non-empty string' }
  }

  if (
    !Array.isArray(definition.requiredDamageKeywords)
    || definition.requiredDamageKeywords.length === 0
    || !definition.requiredDamageKeywords.every(keyword => typeof keyword === 'string' && keyword.trim())
  ) {
    return { ok: false, statusCode: 400, error: 'Required damage keywords must be a non-empty string array' }
  }

  if (typeof definition.textureAlias !== 'string' || !definition.textureAlias.trim()) {
    return { ok: false, statusCode: 400, error: 'Texture alias must be a non-empty string' }
  }

  if (!isSafePathPart(definition.assetFileStem)) {
    return { ok: false, statusCode: 400, error: 'Asset file stem must be a safe path segment' }
  }

  const displayTypes = new Set(['tile', 'circularTile', 'centered'])
  if (!definition.display || Array.isArray(definition.display) || typeof definition.display !== 'object' || !displayTypes.has(definition.display.type)) {
    return { ok: false, statusCode: 400, error: 'Display type must be tile, circularTile, or centered' }
  }

  if (definition.tickPulse !== undefined && (Array.isArray(definition.tickPulse) || typeof definition.tickPulse !== 'object')) {
    return { ok: false, statusCode: 400, error: 'Tick pulse must be a JSON object when present' }
  }

  if (definition.animation !== undefined && (Array.isArray(definition.animation) || typeof definition.animation !== 'object')) {
    return { ok: false, statusCode: 400, error: 'Animation must be a JSON object when present' }
  }

  const numericFields = [
    'alpha',
    'priority',
    'zIndex',
    'display.initialRotationRadians',
    'display.angleRadians',
    'display.lengthToRepeat',
    'display.spriteZoom',
    'tickPulse.durationSeconds',
    'tickPulse.startScale',
    'tickPulse.pulseSpeed',
    'animation.scrollXPerSecond',
    'animation.scrollYPerSecond',
    'animation.rotationPerSecond',
    'animation.pulseAmount',
    'animation.pulseSpeed',
  ]

  for (const field of numericFields) {
    const value = getNestedValue(definition, field)
    if (value !== undefined && !Number.isFinite(value)) {
      return { ok: false, statusCode: 400, error: `${field} must be a finite number` }
    }
  }

  return { ok: true }
}

function getNestedValue(source, pathKey) {
  return pathKey.split('.').reduce((value, key) => (
    value && typeof value === 'object' ? value[key] : undefined
  ), source)
}

async function saveEnemyAnimationSpriteUpload(fields, imageFile) {
  const action = {
    biome: fields.biome,
    fileStem: fields.fileStem,
    atlas: fields.atlas ? JSON.parse(fields.atlas) : undefined,
  }
  const target = resolveEnemyAnimationSpriteTarget(action)

  if (!target.ok) {
    const error = new Error(target.error)
    error.statusCode = target.statusCode
    throw error
  }

  if (!imageFile?.buffer?.length || imageFile.contentType !== 'image/png') {
    throw new Error('Enemy animation upload must include a PNG image')
  }

  if (!isValidEnemyAnimationAtlas(action.atlas, action.fileStem)) {
    const error = new Error('Enemy animation atlas must include frames, animations, and matching metadata')
    error.statusCode = 400
    throw error
  }

  await mkdir(target.dir, { recursive: true })
  await writeFile(target.imagePath, imageFile.buffer)
  await writeFile(target.atlasPath, `${JSON.stringify(action.atlas, null, 2)}\n`, 'utf8')

  return {
    action: 'saved',
    imageFile: target.relativeImagePath,
    atlasFile: target.relativeAtlasPath,
  }
}

function resolveEnemyAnimationSpriteTarget(action) {
  const biomes = new Set(['wasteland'])

  if (!biomes.has(action?.biome)) {
    return { ok: false, statusCode: 400, error: 'Enemy animation biome is not supported' }
  }

  if (!action?.fileStem || !isSafePathPart(action.fileStem)) {
    return { ok: false, statusCode: 400, error: 'Enemy animation file stem must be a safe path segment' }
  }

  const collectionDir = path.resolve(gameAssetsDir, 'enemies')
  const dir = path.resolve(collectionDir, action.biome)
  const imagePath = path.resolve(dir, `${action.fileStem}.png`)
  const atlasPath = path.resolve(dir, `${action.fileStem}.json`)

  if (!dir.startsWith(`${collectionDir}${path.sep}`) || !imagePath.startsWith(`${dir}${path.sep}`) || !atlasPath.startsWith(`${dir}${path.sep}`)) {
    return { ok: false, statusCode: 400, error: 'Resolved enemy animation path is outside the asset directory' }
  }

  return {
    ok: true,
    dir,
    imagePath,
    atlasPath,
    relativeImagePath: path.relative(path.join(__dirname, '..'), imagePath).replaceAll(path.sep, '/'),
    relativeAtlasPath: path.relative(path.join(__dirname, '..'), atlasPath).replaceAll(path.sep, '/'),
  }
}

function isValidEnemyAnimationAtlas(atlas, fileStem) {
  if (!atlas || Array.isArray(atlas) || typeof atlas !== 'object') return false
  if (!atlas.frames || Array.isArray(atlas.frames) || typeof atlas.frames !== 'object') return false
  if (!atlas.animations || Array.isArray(atlas.animations) || typeof atlas.animations !== 'object') return false
  if (!atlas.meta || Array.isArray(atlas.meta) || typeof atlas.meta !== 'object') return false
  if (atlas.meta.image !== `${fileStem}.png`) return false
  if (!atlas.meta.enemyVisualMetadata || Array.isArray(atlas.meta.enemyVisualMetadata) || typeof atlas.meta.enemyVisualMetadata !== 'object') return false

  const animation = atlas.animations[fileStem]
  if (!Array.isArray(animation) || animation.length === 0) return false

  return animation.every(frameKey => typeof frameKey === 'string' && atlas.frames[frameKey])
}

function isSafePathPart(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value)
}
