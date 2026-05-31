import logger from '@/log'
import TowLeveCommonProvider from '../internal/two-level-common'
import LocalhostccApiClient from './api'

const localhostccLogger = logger.extend('localhostcc')
class LocalhostccProvider extends TowLeveCommonProvider {
  constructor(apiKey: string) {
    super(new LocalhostccApiClient(apiKey))
  }

  async cleanup(domain: string, value: string): Promise<void> {
    localhostccLogger('cleanup', domain, value)
    await super.cleanup(domain, value)
  }

  async present(domain: string, value: string): Promise<void> {
    localhostccLogger('present', domain, value)
    await super.present(domain, value)
  }
}

export default LocalhostccProvider
