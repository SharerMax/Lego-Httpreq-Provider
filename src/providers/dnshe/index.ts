import type { Payload } from '../internal/base'
import crypto from 'node:crypto'
import logger from '@/log'
import BaseProvider, { isDefaultModePayload } from '../internal/base'
import DnsheApiClient from './api'

const dnsheLogger = logger.extend('dnshe')
class DnsheProvider extends BaseProvider {
  private dnsheApiClient: DnsheApiClient
  constructor(apiKey: string, apiSecret: string) {
    super()
    this.dnsheApiClient = new DnsheApiClient(apiKey, apiSecret)
  }

  parseDomainInfo(fqdn: string) {
    const splitFqdn = fqdn.split('.')
    const domainInfo = {
      domain: splitFqdn.slice(-3).join('.'), // three levels
      host: splitFqdn.slice(0, -3).join('.'),
    }
    if (domainInfo.host === '') {
      domainInfo.host = '_acme-challenge'
    }
    else {
      domainInfo.host = `_acme-challenge.${domainInfo.host}`
    }
    return domainInfo
  }

  async present(domain: string, value: string): Promise<void> {
    dnsheLogger('present', domain, value)
    const domainInfo = this.parseDomainInfo(domain)
    const result = await this.dnsheApiClient.presentChallengeRecord(domainInfo.domain, domainInfo.host, value)
    dnsheLogger(result)
  }

  async cleanup(domain: string, value: string): Promise<void> {
    dnsheLogger('cleanup', domain, value)
    const domainInfo = this.parseDomainInfo(domain)
    const result = await this.dnsheApiClient.cleanupChallengeRecord(domainInfo.domain, domainInfo.host)
    dnsheLogger(result)
  }
}

export default DnsheProvider
