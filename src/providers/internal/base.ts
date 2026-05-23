export interface DefaultModePayload {
  fqdn: string
  value: string
}

export interface RawModePayload {
  domain: string
  token: string
  keyAuth: string
}

export type Payload = DefaultModePayload | RawModePayload

export function isDefaultModePayload(payload: Payload): payload is DefaultModePayload {
  return 'fqdn' in payload
}

export function isRawModePayload(payload: Payload): payload is RawModePayload {
  return 'domain' in payload
}

export function isPayload(payload: Payload): payload is Payload {
  return isDefaultModePayload(payload) || isRawModePayload(payload)
}

abstract class BaseProvider {
  abstract present(payload: Payload): Promise<void>
  abstract cleanup(payload: Payload): Promise<void>
}

export default BaseProvider
