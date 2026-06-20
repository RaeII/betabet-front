import { applyFlagCacheToResponse, buildFlagCacheHeader } from '@/lib/flagCache'

interface ApiError {
  message?: string
  error?: string
  code?: string
  issues?: { path: string; message: string }[]
}

export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(init?.headers as Record<string, string> | undefined),
  }

  const flagCacheHeader = buildFlagCacheHeader()
  if (flagCacheHeader) {
    headers['x-betabet-cached-flags'] = flagCacheHeader
  }

  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({
      message: 'Unknown error',
      code: 'UNKNOWN',
    }))) as ApiError
    const message = body.message ?? body.error ?? 'Unknown error'
    throw new ApiRequestError(body.code ?? 'UNKNOWN', message, response.status)
  }

  if (response.status === 204) return undefined as T
  const json = (await response.json()) as T
  applyFlagCacheToResponse(json)
  return json
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export function apiDelete<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'DELETE',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}
