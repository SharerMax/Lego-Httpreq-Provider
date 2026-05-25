import type { Payload } from '../internal/base'
import crypto from 'node:crypto'
import logger from '@/log'
import BaseProvider, { isDefaultModePayload } from '../internal/base'
import Vps8ApiClient from './api'

const vps8Logger = logger.extend('vps8')

class Vps8Provide extends BaseProvider {
  private vps8ApiClient: Vps8ApiClient
  constructor(username: string, password: string) {
    super()
    vps8Logger('vps8 provider initialized. username: %s password: %s', username, password)
    this.vps8ApiClient = new Vps8ApiClient(username, password)
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

  async present(payload: Payload): Promise<void> {
    vps8Logger('present', payload)
    if (isDefaultModePayload(payload)) {
      const domainInfo = this.parseDomainInfo(payload.fqdn)
      const result = await this.vps8ApiClient.presentChallengeRecord(domainInfo.domain, domainInfo.host, payload.value)
      vps8Logger(result)
    }
    else {
      const domainInfo = this.parseDomainInfo(payload.domain)
      if (domainInfo.host === '') {
        domainInfo.host = '_acme-challenge'
      }
      else {
        domainInfo.host = `_acme-challenge.${domainInfo.host}`
      }
      const vaule = crypto.createHash('sha256').update(payload.keyAuth).digest('base64url')
      const result = await this.vps8ApiClient.presentChallengeRecord(domainInfo.domain, domainInfo.host, vaule)
      vps8Logger(result)
    }
  }

  async cleanup(payload: Payload): Promise<void> {
    vps8Logger('cleanup', payload)
    if (isDefaultModePayload(payload)) {
      const domainInfo = this.parseDomainInfo(payload.fqdn)
      const result = await this.vps8ApiClient.cleanupChallengeRecord(domainInfo.domain, domainInfo.host)
      vps8Logger(result)
    }
    else {
      const domainInfo = this.parseDomainInfo(payload.domain)
      if (domainInfo.host === '') {
        domainInfo.host = '_acme-challenge'
      }
      else {
        domainInfo.host = `_acme-challenge.${domainInfo.host}`
      }
      const result = await this.vps8ApiClient.cleanupChallengeRecord(domainInfo.domain, domainInfo.host)
      vps8Logger(result)
    }
  }
}

export default Vps8Provide
