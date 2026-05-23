import path from 'node:path'
import process from 'node:process'
// import process from 'node:process'
import { serve } from '@hono/node-server'
// import cac from 'cac'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { loadConfig } from './config'
import logger from './log'
// import { basicAuth } from 'hono/basic-auth'
import { getProvider, hasProvider } from './providers'
import { isPayload } from './providers/internal/base'

// import pkg from '../package.json' with { type: 'json' }

// const cli = cac('lrp')
// cli.command('start').action(() => {})
// cli.option('-p, --port <port>', 'Port to listen on', { default: 3000 })
// cli.help()
// cli.version(pkg.version)
// const parsedArgv = cli.parse(process.argv, { run: false })

const config = loadConfig(path.join(process.cwd(), 'config.toml'))

const app = new Hono()

// TODO: read authentication form config file
// app.use('/*', basicAuth({ username: 'user', password: 'password' }))
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
  port: 3000,
  hostname: '0.0.0.0',
  fetch: app.fetch,
}, info => logger(`Listening on http://${info.address}:${info.port}`))
