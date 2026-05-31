import logger from '@/log'
import BaseApiClient from '../internal/base-api'

const BASE_API_URL = 'https://localhost.cc/api/v1/open/subdomains'
const localhostccApiLogger = logger.extend('localhostcc-api')
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

interface SubDomain {
  id: number
  domain_id: number
  name: string
  status: string // active
  fqdn: string
}

interface SubDomainRecord {
  id: number
  subdomain_id: number
  name: string
  type: string // TXT
  content: string
  ttl: number
  proxied: boolean
  created_at: string
  updated_at: string
}

class LocalhostccApiClient extends BaseApiClient {
  private apiKey: string
  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  private isApiResponse(response: unknown): response is ApiResponse<unknown> {
    return typeof response === 'object' && response !== null && 'code' in response && 'data' in response
  }

  private toResult<T>(response: unknown): T | null {
    if (!this.isApiResponse(response)) {
      throw new Error('Invalid response')
    }
    if (response.code !== 0) {
      throw new Error(response.message)
    }
    return response.data !== null ? response.data as T : null
  }

  async listSubDomains() {
    const response = await fetch(BASE_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    }).then(res => res.json())

    return this.toResult<SubDomain[]>(response)
  }

  async listRecords(subdomain: string) {
    const existedSubdomains = await this.listSubDomains()
    if (existedSubdomains) {
      const subdomainIndex = existedSubdomains.findIndex(subdomainInfo => subdomainInfo.fqdn === subdomain)

      if (subdomainIndex !== -1) {
        const response = await fetch(`${BASE_API_URL}/${existedSubdomains[subdomainIndex].id}/records`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }).then(res => res.json())
        return this.toResult<SubDomainRecord[]>(response) || []
      }
    }
    return []
  }

  async addRecord(subdomainId: number, name: string, type: string, content: string, ttl = 600) {
    const response = await fetch(`${BASE_API_URL}/${subdomainId}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        name,
        type,
        content,
        ttl,
      }),
    }).then(res => res.json())
    return this.toResult<SubDomainRecord>(response)
  }

  async updateRecord(subdomainId: number, recordId: number, content: string) {
    const response = await fetch(`${BASE_API_URL}/${subdomainId}/records/${recordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        content,
      }),
    }).then(res => res.json())
    return this.toResult<SubDomainRecord>(response)
  }

  async deleteRecord(subdomainId: number, recordId: number) {
    const response = await fetch(`${BASE_API_URL}/${subdomainId}/records/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    }).then(res => res.json())
    return this.toResult<void>(response)
  }

  async cleanupChallengeRecord(domain: string, host: string): Promise<boolean> {
    localhostccApiLogger.log('cleanupChallengeRecord', domain, host)
    const records = await this.listRecords(domain)
    const challengeRecord = records.find(record => record.name === host && record.type === 'TXT')

    if (challengeRecord) {
      await this.deleteRecord(0, challengeRecord.id)
      return true
    }
    return true
  }

  async presentChallengeRecord(domain: string, host: string, token: string): Promise<boolean> {
    localhostccApiLogger.log('presentChallengeRecord', domain, host, token)
    const records = await this.listRecords(domain)
    const challengeRecord = records.find(record => record.name === host && record.type === 'TXT')
    if (challengeRecord === undefined) {
      const newRecord = (await this.addRecord(0, host, 'TXT', token, 300))
      if (!newRecord) {
        return false
      }
      return true
    }
    else {
      const newRecord = (await this.updateRecord(0, challengeRecord.id, token))
      if (!newRecord) {
        return false
      }
      return true
    }
  }
}

export default LocalhostccApiClient
