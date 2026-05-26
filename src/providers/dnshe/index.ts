import logger from '@/log'
import { generateChallengeDomain } from '@/utils/domain'
import BaseProvider from '../internal/base'
import DnsheApiClient from './api'

const dnsheLogger = logger.extend('dnshe')
class DnsheProvider extends BaseProvider {
  private dnsheApiClient: DnsheApiClient
  constructor(apiKey: string, apiSecret: string) {
    super()
    this.dnsheApiClient = new DnsheApiClient(apiKey, apiSecret)
  }

  async present(domain: string, value: string): Promise<void> {
    dnsheLogger('present', domain, value)
    const domainInfo = generateChallengeDomain(domain, 3)
    const result = await this.dnsheApiClient.presentChallengeRecord(domainInfo.domain, domainInfo.host, value)
    dnsheLogger(result)
  }

  async cleanup(domain: string, value: string): Promise<void> {
    dnsheLogger('cleanup', domain, value)
    const domainInfo = generateChallengeDomain(domain, 3)
    const result = await this.dnsheApiClient.cleanupChallengeRecord(domainInfo.domain, domainInfo.host)
    dnsheLogger(result)
  }
}

export default DnsheProvider
