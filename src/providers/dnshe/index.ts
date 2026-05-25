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
    else {
      const vaule = crypto.createHash('sha256').update(payload.keyAuth).digest('base64url')
      const domainInfo = this.parseDomainInfo(payload.domain)
      if (domainInfo.host === '') {
        domainInfo.host = '_acme-challenge'
      }
      else {
        domainInfo.host = `_acme-challenge.${domainInfo.host}`
      }
      const result = await this.dnsheApiClient.presentChallengeRecord(domainInfo.domain, ['_acme-challenge', domainInfo.host].join('.'), vaule)
      dnsheLogger(result)
    }
  }

  async cleanup(payload: Payload) {
    dnsheLogger('cleanup', payload)
    if (isDefaultModePayload(payload)) {
      const domainInfo = this.parseDomainInfo(payload.fqdn)
      const result = await this.dnsheApiClient.cleanupChallengeRecord(domainInfo.domain, domainInfo.host)
      dnsheLogger(result)
    }
    else {
      const result = await this.dnsheApiClient.cleanupChallengeRecord(payload.domain, '_acme-challenge')
      dnsheLogger(result)
    }
  }
}

export default DnsheProvider
