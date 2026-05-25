import logger from '@/log'
import BaseProvider from '../internal/base'
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
    vps8Logger('present', domain, value)
    const domainInfo = this.parseDomainInfo(domain)
    const result = await this.vps8ApiClient.presentChallengeRecord(domainInfo.domain, domainInfo.host, value)
    vps8Logger(result)
  }

  async cleanup(domain: string, value: string): Promise<void> {
    vps8Logger('cleanup', domain, value)
    const domainInfo = this.parseDomainInfo(domain)
    const result = await this.vps8ApiClient.cleanupChallengeRecord(domainInfo.domain, domainInfo.host)
    vps8Logger(result)
  }
}

export default Vps8Provide
