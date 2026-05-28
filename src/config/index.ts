import fs from 'node:fs'
import { merge } from 'es-toolkit'
import { parse } from 'smol-toml'
import logger from '@/log'

const configLogger = logger.extend('config')

const defaultConfig = {
  server: {
    port: 3000,
    bind: '127.0.0.1',
    auth: {
      username: '',
      password: '',
    },
  },
  provider: {
    vps8: {
      enable: false,
      username: '',
      password: '',
    },
    dnshe: {
      enable: false,
      apiKey: '',
      apiSecret: '',
    },
  },
}

export type Config = typeof defaultConfig

export function loadConfig(path: string): Config {
  configLogger(`Loading config from ${path}`)
  // read config file
  const configContent = fs.readFileSync(path, 'utf-8')
  const config = merge(defaultConfig, parse(configContent))

  configLogger('Config loaded')
  configLogger(config)
  return config
}
