import fs from 'node:fs'
import { parse } from 'smol-toml'
import logger from '@/log'

const configLogger = logger.extend('config')

const defaultConfig = {
  auth: {
    username: '',
    password: '',
  },
  provider: {
    vps8: {
      username: '',
      password: '',
    },
    dnshe: {
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
  const config = Object.assign({}, defaultConfig, parse(configContent))

  configLogger('Config loaded')
  configLogger(config)
  return config
}
