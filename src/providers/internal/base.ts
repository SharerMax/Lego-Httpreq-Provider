import * as z from 'zod'

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

export function isDefaultModePayload(payload: unknown): payload is DefaultModePayload {
  return z.object({
    fqdn: z.string(),
    value: z.string(),
  }).safeParse(payload).success
}

export function isRawModePayload(payload: unknown): payload is RawModePayload {
  return z.object({
    domain: z.string(),
    token: z.string(),
    keyAuth: z.string(),
  }).safeParse(payload).success
}

export function isPayload(payload: unknown): payload is Payload {
  return isDefaultModePayload(payload) || isRawModePayload(payload)
}

abstract class BaseProvider {
  abstract present(domain: string, value: string): Promise<void>
  abstract cleanup(domain: string, value: string): Promise<void>
}

export default BaseProvider
