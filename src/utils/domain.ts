export function parseDomain(fqdn: string, level: number = 2) {
  if (level < 1) {
    throw new Error('level must be greater than 0')
  }
  const splitFqdn = fqdn.split('.')
  if (splitFqdn.length < level) {
    throw new Error('fqdn is too short')
  }
  const domainInfo = {
    domain: splitFqdn.slice(-level).join('.'),
    host: splitFqdn.slice(0, -level).join('.'),
  }
  return domainInfo
}

export function generateChallengeDomain(fqdn: string, level: number = 2) {
  const domainInfo = parseDomain(fqdn, level)
  if (domainInfo.host === '') {
    domainInfo.host = '_acme-challenge'
  }
  else {
    domainInfo.host = `_acme-challenge.${domainInfo.host}`
  }
  return domainInfo
}
