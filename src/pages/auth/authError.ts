import { ApiRequestError } from '@/services/api'

export function getApiRequestMessage(error: unknown, fallback: string) {
  return error instanceof ApiRequestError ? error.message || fallback : fallback
}
