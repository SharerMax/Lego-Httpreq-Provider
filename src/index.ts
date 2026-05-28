import type { ProviderName } from './providers'
import type { Payload } from './providers/internal/base'
import crypto from 'node:crypto'
import path from 'node:path'
import process from 'node:process'
import { serve } from '@hono/node-server'
import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import * as z from 'zod'
import { loadConfig } from './config'
import logger from './log'
import { getProvider, hasProvider } from './providers'
import { isDefaultModePayload, isPayload } from './providers/internal/base'

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

const payloadSchema = z.custom<Payload>(value => isPayload(value))
const providerNameSchema = z.custom<ProviderName>(value => typeof value === 'string' && hasProvider(value))

function parseChallengeInfo(payload: Payload) {
  // _acme-challenge.domain
  // _acme-challenge.**.**.domain
  if (isDefaultModePayload(payload)) {
    if (payload.fqdn.endsWith('.')) {
      payload.fqdn = payload.fqdn.slice(0, -1)
    }
    return ({
      domain: payload.fqdn.replace(/^_acme-challenge\./, ''),
      value: payload.value,
    })
  }
  else {
    const vaule = crypto.createHash('sha256').update(payload.keyAuth).digest('base64url')
    return ({
      domain: payload.domain,
      value: vaule,
    })
  }
}

app.post('/:providerName/present', sValidator('json', payloadSchema), sValidator('param', z.object({ providerName: providerNameSchema })), async (c) => {
  const providerName = c.req.valid('param').providerName
  const provider = getProvider(providerName, config.provider)
  const payload = c.req.valid('json')
  const challengeInfo = parseChallengeInfo(payload)
  await provider.present(challengeInfo.domain, challengeInfo.value)
  return c.text('success')
})
app.post('/:providerName/cleanup', sValidator('json', payloadSchema), sValidator('param', z.object({ providerName: providerNameSchema })), async (c) => {
  const providerName = c.req.valid('param').providerName
  const provider = getProvider(providerName, config.provider)
  const payload = c.req.valid('json')
  const challengeInfo = parseChallengeInfo(payload)
  await provider.cleanup(challengeInfo.domain, challengeInfo.value)
  return c.text('success')
})

serve({
  port: config.server.port,
  hostname: config.server.bind,
  fetch: app.fetch,
}, info => logger(`Listening on http://${info.address}:${info.port}`))
