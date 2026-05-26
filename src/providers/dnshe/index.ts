import logger from '@/log'
import TowLeveCommonProvider from '../internal/two-level-common'
import DnsheApiClient from './api'

const dnsheLogger = logger.extend('dnshe')
class DnsheProvider extends TowLeveCommonProvider {
  constructor(apiKey: string, apiSecret: string) {
    super(new DnsheApiClient(apiKey, apiSecret))
  }

  async present(domain: string, value: string): Promise<void> {
    dnsheLogger('present', domain, value)
    super.present(domain, value)
  }

  async cleanup(domain: string, value: string): Promise<void> {
    dnsheLogger('cleanup', domain, value)
    super.cleanup(domain, value)
  }
}

export default DnsheProvider
