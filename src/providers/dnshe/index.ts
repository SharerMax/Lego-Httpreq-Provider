import type { Payload } from '../internal/base'
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
    // _acme-challenge.domain
    // _acme-challenge.**.**.domain
    const normalizedFqdn = fqdn.endsWith('.') ? fqdn.slice(0, -1) : fqdn
    const splitFqdn = normalizedFqdn.split('.')

    return ({
      domain: splitFqdn.slice(-3).join('.'), // three levels
      host: splitFqdn.slice(0, -3).join('.'),
    })
  }

  async present(payload: Payload) {
    dnsheLogger('present', payload)
    if (isDefaultModePayload(payload)) {
      const domainInfo = this.parseDomainInfo(payload.fqdn)
      const result = await this.dnsheApiClient.presentChallengeRecord(domainInfo.domain, domainInfo.host, payload.value)
      dnsheLogger(result)
    }
    throw new Error('Not supported mode.')
  }

  async cleanup(payload: Payload) {
    dnsheLogger('cleanup', payload)
    if (isDefaultModePayload(payload)) {
      const domainInfo = this.parseDomainInfo(payload.fqdn)
      const result = await this.dnsheApiClient.cleanupChallengeRecord(domainInfo.domain, domainInfo.host)
      dnsheLogger(result)
    }
    throw new Error('Not supported mode.')
  }
}

export default DnsheProvider
