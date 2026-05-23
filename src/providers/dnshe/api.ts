const DNS_RECORD_BASE_API_URL = 'https://api005.dnshe.com/index.php?m=domain_hub&endpoint=dns_records&'
const SUBDOMAIN_RECORD_BASE_API_URL = 'https://api005.dnshe.com/index.php?m=domain_hub&endpoint=subdomains&'

type RECORD_TYPE = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'SRV' | 'NS' | 'CAA'
interface DNSRecord {
  id: number
  name: string
  type: RECORD_TYPE
  content: string
  ttl: number
  status: string
  created_at: string
}

interface Subdomain {
  id: number
  subdomain: string
  rootdomain: string
  status: string
  created_at: string
}

interface Pagination {
  page: number
  per_page: number
  has_more: boolean
  next_page: number
  prev_page: number
  total: number
}

interface ApiResponse {
  success: boolean
}

interface ListRecordsResponse extends ApiResponse {
  count: number
  records: DNSRecord[]
}

interface ListSubdomainsResponse extends ApiResponse {
  count: number
  subdomains: Subdomain[]
  pagination: Pagination
}

interface ModifyRecordResponse extends ApiResponse {
  message: string
  id: number
}

interface DeleteRecordResponse extends ApiResponse {
  message: string
}

class DnsheApiClient {
  private authHeader: Record<string, string>
  constructor(apiKey: string, apiSecret: string) {
    this.authHeader = {
      'X-API-Key': apiKey,
      'X-API-Secret': apiSecret,
    }
  }

  async listSubdomains(subdomain: string) {
    const response = await fetch(`${SUBDOMAIN_RECORD_BASE_API_URL}action=list&status=active&search=${subdomain}`, {
      headers: this.authHeader,
    }).then(res => res.json())
    if (typeof response !== 'object' || response === null) {
      throw new Error('Failed to list subdomains')
    }
    return response as ListSubdomainsResponse
  }

  async listRecord(subdomainId: number) {
    const response = await fetch(`${DNS_RECORD_BASE_API_URL}action=list&status=active&subdomain_id=${subdomainId}`, {
      headers: this.authHeader,
    }).then(res => res.json())
    if (typeof response !== 'object' || response === null) {
      throw new Error('Failed to list records')
    }
    return response as ListRecordsResponse
  }

  async createRecord(subdomainId: number, name: string, type: RECORD_TYPE, content: string, ttl = 600) {
    const response = await fetch(`${DNS_RECORD_BASE_API_URL}action=create`, {
      method: 'POST',
      headers: this.authHeader,
      body: JSON.stringify({
        subdomain_id: subdomainId,
        name,
        type,
        content,
        ttl,
      }),
    }).then(res => res.json())
    if (typeof response !== 'object' || response === null) {
      throw new Error('Failed to create record')
    }
    return response as ModifyRecordResponse
  }

  async updateRecord(id: number, type: RECORD_TYPE, content: string, ttl = 600) {
    const response = await fetch(`${DNS_RECORD_BASE_API_URL}action=update`, {
      method: 'PATCH',
      headers: this.authHeader,
      body: JSON.stringify({
        id,
        content,
        type,
        ttl,
      }),
    }).then(res => res.json())
    if (typeof response !== 'object' || response === null) {
      throw new Error('Failed to update record')
    }
    return response as ModifyRecordResponse
  }

  async deleteRecord(id: number) {
    const response = await fetch(`${DNS_RECORD_BASE_API_URL}action=delete`, {
      method: 'DELETE',
      headers: this.authHeader,
      body: JSON.stringify({
        id,
      }),
    }).then(res => res.json())
    if (typeof response !== 'object' || response === null) {
      throw new Error('Failed to delete record')
    }
    return response as DeleteRecordResponse
  }

  async presentChallengeRecord(subdomain: string, name: string, token: string) {
    const subdomainRecord = (await this.listSubdomains(subdomain)).subdomains.find(subdomainRecord => `${subdomainRecord.subdomain}.${subdomainRecord.rootdomain}` === subdomain)
    if (!subdomainRecord) {
      throw new Error('Subdomain not found')
    }
    const dnsRecord = (await this.listRecord(subdomainRecord.id)).records.find(record => record.name === `${name}.${subdomain}`)
    if (!dnsRecord) {
      return this.createRecord(subdomainRecord.id, name, 'TXT', token, 300)
    }
    else {
      return this.updateRecord(dnsRecord.id, 'TXT', token, 300)
    }
  }

  async cleanupChallengeRecord(subdomain: string, name: string) {
    const subdomainRecord = (await this.listSubdomains(subdomain)).subdomains.find(subdomainRecord => `${subdomainRecord.subdomain}.${subdomainRecord.rootdomain}` === subdomain)
    if (!subdomainRecord) {
      return {
        success: true,
        message: 'Subdomain not found or already deleted',
      }
    }
    const dnsRecord = (await this.listRecord(subdomainRecord.id)).records.find(record => record.name === `${name}.${subdomain}`)
    if (!dnsRecord) {
      return {
        success: true,
        message: 'Record not found or already deleted',
      }
    }
    await this.deleteRecord(dnsRecord.id)
  }
}

export default DnsheApiClient
