import logger from '@/log'
import TowLeveCommonProvider from '../internal/two-level-common'
import DnsheApiClient from './api'

const dnsheLogger = logger.extend('dnshe')
class DnsheProvider extends TowLeveCommonProvider {
  constructor(apiKey: string, apiSecret: string) {
    super(new DnsheApiClient(apiKey, apiSecret))
  }

  async present(domain: string, value: string) {
    dnsheLogger('present', domain, value)
    await super.present(domain, value)
  }

  async cleanup(domain: string, value: string) {
    dnsheLogger('cleanup', domain, value)
    await super.cleanup(domain, value)
  }
}

export default DnsheProvider
