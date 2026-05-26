import type BaseApiClient from './base-api'
import { generateChallengeDomain } from '@/utils/domain'
import BaseProvider from './base'

class TowLeveCommonProvider extends BaseProvider {
  protected apiClient: BaseApiClient
  constructor(apiClient: BaseApiClient) {
    super()
    this.apiClient = apiClient
  }

  async present(domain: string, value: string): Promise<void> {
    const domainInfo = generateChallengeDomain(domain, 3)
    await this.apiClient.presentChallengeRecord(domainInfo.domain, domainInfo.host, value)
  }

  async cleanup(domain: string, _: string): Promise<void> {
    const domainInfo = generateChallengeDomain(domain, 3)
    await this.apiClient.cleanupChallengeRecord(domainInfo.domain, domainInfo.host)
  }
}

export default TowLeveCommonProvider
