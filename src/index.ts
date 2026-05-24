import path from 'node:path'
import process from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { HTTPException } from 'hono/http-exception'
import { loadConfig } from './config'
import logger from './log'
import { getProvider, hasProvider } from './providers'
import { isPayload } from './providers/internal/base'

// load config
const configFilePath = process.env.LRP_CONFIG_FILE || 'config.toml'
let configFileAbsolutePath = configFilePath
if (!path.isAbsolute(configFilePath))
  configFileAbsolutePath = path.join(process.cwd(), configFilePath)
const config = loadConfig(configFileAbsolutePath)

// web server
const app = new Hono()
app.use('/*', basicAuth({ username: config.server.auth.username, password: config.server.auth.password }))
app.get('/', c => c.text('pong!'))
app.post('/:providerName/present', async (c) => {
  const providerName = c.req.param('providerName')
  if (!hasProvider(providerName))
    throw new HTTPException(404, { message: 'Provider not found' })
  const provider = getProvider(providerName, config.provider)
  const body = await c.req.json()
  if (!isPayload(body))
    throw new HTTPException(400, { message: 'Invalid payload' })
  await provider.present(body)
  return c.text('success')
})
app.post('/:providerName/cleanup', async (c) => {
  const providerName = c.req.param('providerName')
  if (!hasProvider(providerName))
    throw new HTTPException(404, { message: 'Provider not found' })
  const provider = getProvider(providerName, config.provider)
  const body = await c.req.json()
  if (!isPayload(body))
    throw new HTTPException(400, { message: 'Invalid payload' })
  await provider.cleanup(body)
  return c.text('success')
})
serve({
  port: config.server.port,
  hostname: config.server.bind,
  fetch: app.fetch,
}, info => logger(`Listening on http://${info.address}:${info.port}`))
