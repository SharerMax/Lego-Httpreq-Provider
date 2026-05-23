import type BaseProvider from './internal/base'
import type { Config } from '@/config'
import DnsheProvider from './dnshe'
import Vps8Provide from './vps8'

export type ProviderName = keyof Config['provider']
export type Providers = {
  [P in ProviderName]: (providerConfig: Config['provider'][P]) => BaseProvider
}
export const providers: Providers = {
  vps8: (vps8Confg: Config['provider']['vps8']) => new Vps8Provide(vps8Confg.username, vps8Confg.password),
  dnshe: (dnsheConfig: Config['provider']['dnshe']) => new DnsheProvider(dnsheConfig.apiKey, dnsheConfig.apiSecret),
}
const cachedProviders: Partial<Record<ProviderName, BaseProvider>> = {}
export function hasProvider(providerName: string): providerName is ProviderName {
  return providerName in providers
}
export function getProvider<P extends ProviderName>(providerName: P, providersConfig: Config['provider']): BaseProvider {
  if (!hasProvider(providerName))
    throw new Error(`Provider ${providerName} not found`)
  if (cachedProviders[providerName])
    return cachedProviders[providerName]
  const provider = providers[providerName](providersConfig[providerName])
  cachedProviders[providerName] = provider
  return provider
}
