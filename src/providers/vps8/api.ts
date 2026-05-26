import { Buffer } from 'node:buffer'
import logger from '@/log'

const API_URL = 'https://vps8.zz.cd/api/client/dnsopenapi'
export type RECORD_TYPE = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS'
const vps8ApiLogger = logger.extend('vps8-api')
interface ApiError {
  code: number
  message: string
}
interface ApiResponse<T> {
  error: ApiError | null
  result: T | null
}
interface DNSRecord {
  id: number
  domain: string
  host: string
  type: RECORD_TYPE
  value: string
}

interface DomainListItem {
  domain: string
  platform_type: string
  source_service: string
  created_at: string
  expires_at: string
}

class Vps8ApiClient {
  private basicAuth: string
  constructor(userName: string, password: string) {
    this.basicAuth = Buffer.from(`${userName}:${password}`).toString('base64')
  }

  isApiResponse<T>(response: unknown): response is ApiResponse<T> {
    return typeof response === 'object' && response !== null && 'error' in response && 'result' in response
  }

  toResult<T>(response: unknown): T | null {
    if (!this.isApiResponse<T>(response)) {
      throw new Error('Invalid response')
    }
    if (response.error) {
      throw new Error(response.error.message)
    }
    return response.result
  }

  async listDomains() {
    vps8ApiLogger.log('listDomains')
    const response = await fetch(`${API_URL}/domain_list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${this.basicAuth}`,
      },
    }).then(res => res.json())
    vps8ApiLogger.log('listDomains response', response)
    return this.toResult<DomainListItem[]>(response)
  }

  async listRecords(domain: string) {
    vps8ApiLogger.log('listRecords', domain)
    const response = await fetch(`${API_URL}/record_list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${this.basicAuth}`,
      },
      body: JSON.stringify({
        domain,
      }),
    }).then(res => res.json())
    vps8ApiLogger.log('listRecords response', domain, response)
    return this.toResult<DNSRecord[]>(response)
  }

  async createRecord(domain: string, host: string, type: RECORD_TYPE, value: string, ttl = 600) {
    vps8ApiLogger.log('createRecord', domain, host, type, value, ttl)
    const response = await fetch(`${API_URL}/record_create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${this.basicAuth}`,
      },
      body: JSON.stringify({
        domain,
        host,
        type,
        value,
        ttl,
      }),
    }).then(res => res.json())
    vps8ApiLogger.log('createRecord response', domain, host, type, value, ttl, response)
    return this.toResult<{ domain: string, ok: boolean, record: DNSRecord }>(response)
  }

  async updateRecord(domain: string, id: number, value: string, ttl = 600) {
    vps8ApiLogger.log('updateRecord', domain, id, value, ttl)
    const response = await fetch(`${API_URL}/record_update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${this.basicAuth}`,
      },
      body: JSON.stringify({
        id,
        domain,
        value,
        ttl,
      }),
    }).then(res => res.json())
    vps8ApiLogger.log('updateRecord response', domain, id, value, ttl, response)
    return this.toResult<{ domain: string, ok: boolean, record: DNSRecord }>(response)
  }

  async deleteRecord(domain: string, id: number) {
    vps8ApiLogger.log('deleteRecord', domain, id)
    const response = await fetch(`${API_URL}/record_delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${this.basicAuth}`,
      },
      body: JSON.stringify({
        domain,
        id,
      }),
    }).then(res => res.json())
    vps8ApiLogger.log('deleteRecord response', domain, id, response)
    return this.toResult<{ domain: string, ok: boolean, delete_id: number }>(response)
  }

  async presentChallengeRecord(domain: string, host: string, token: string) {
    vps8ApiLogger.log('presentChallengeRecord', domain, host, token)
    const records = await this.listRecords(domain) || []
    const challengeRecord = records.find(record => record.host === host && record.type === 'TXT')
    if (challengeRecord === undefined) {
      const newRecord = (await this.createRecord(domain, host, 'TXT', token, 300))?.record
      if (!newRecord) {
        throw new Error('Failed to create record')
      }
      return newRecord
    }
    else {
      const newRecord = (await this.updateRecord(domain, challengeRecord.id, token, 300))?.record
      if (!newRecord) {
        throw new Error('Failed to update record')
      }
      return newRecord
    }
  }

  async cleanupChallengeRecord(domain: string, host: string) {
    vps8ApiLogger.log('cleanupChallengeRecord', domain, host)
    const records = await this.listRecords(domain) || []
    const challengeRecord = records.find(record => record.host === host && record.type === 'TXT')

    if (challengeRecord) {
      const result = (await this.deleteRecord(domain, challengeRecord.id))
      if (!result) {
        throw new Error('Failed to delete record')
      }
      return result
    }
    return { domain, ok: true, delete_id: 0 }
  }
}

export default Vps8ApiClient
