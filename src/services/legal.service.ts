import { apiGet } from './api'

export interface Terms {
  version: string
  updatedAt: string
  content: string
}

export function getTerms(): Promise<Terms> {
  return apiGet('/api/legal/terms')
}
