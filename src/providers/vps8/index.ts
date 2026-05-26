import logger from '@/log'
import { generateChallengeDomain } from '@/utils/domain'
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

  async present(domain: string, value: string): Promise<void> {
    vps8Logger('present', domain, value)
    const domainInfo = generateChallengeDomain(domain, 3)
    const result = await this.vps8ApiClient.presentChallengeRecord(domainInfo.domain, domainInfo.host, value)
    vps8Logger(result)
  }

  async cleanup(domain: string, value: string): Promise<void> {
    vps8Logger('cleanup', domain, value)
    const domainInfo = generateChallengeDomain(domain, 3)
    const result = await this.vps8ApiClient.cleanupChallengeRecord(domainInfo.domain, domainInfo.host)
    vps8Logger(result)
  }
}

export default Vps8Provide
