import type BaseApiClient from './base-api'
import { generateChallengeDomain } from '@/utils/domain'
import BaseProvider from './base'

class TowLeveCommonProvider extends BaseProvider {
  protected apiClient: BaseApiClient
  constructor(apiClient: BaseApiClient) {
    super()
    this.apiClient = apiClient
  }

  async present(domain: string, value: string) {
    const domainInfo = generateChallengeDomain(domain, 3)
    const result = await this.apiClient.presentChallengeRecord(domainInfo.domain, domainInfo.host, value)
    if (!result) {
      throw new Error('present challenge record failed')
    }
  }

  async cleanup(domain: string, _: string) {
    const domainInfo = generateChallengeDomain(domain, 3)
    const result = await this.apiClient.cleanupChallengeRecord(domainInfo.domain, domainInfo.host)
    if (!result) {
      throw new Error('cleanup challenge record failed')
    }
  }
}

export default TowLeveCommonProvider
