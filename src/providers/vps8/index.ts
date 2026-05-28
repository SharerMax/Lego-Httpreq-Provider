import logger from '@/log'
import TowLeveCommonProvider from '../internal/two-level-common'
import Vps8ApiClient from './api'

const vps8Logger = logger.extend('vps8')

class Vps8Provide extends TowLeveCommonProvider {
  constructor(username: string, password: string) {
    vps8Logger('vps8 provider initialized. username: %s password: %s', username, password)
    super(new Vps8ApiClient(username, password))
  }

  async present(domain: string, value: string) {
    vps8Logger('present', domain, value)
    await super.present(domain, value)
  }

  async cleanup(domain: string, value: string) {
    vps8Logger('cleanup', domain, value)
    await super.cleanup(domain, value)
  }
}

export default Vps8Provide
