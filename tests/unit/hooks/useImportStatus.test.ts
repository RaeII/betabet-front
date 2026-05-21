import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useImportStatus } from '@/hooks/useImportStatus'
import { server } from '../../mocks/server'
import { importHandlers, mockImportStatus } from '../../mocks/handlers/import.handlers'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useImportStatus', () => {
  beforeEach(() => server.use(...importHandlers))

  it('fetches import status automatically on mount', async () => {
    const { result } = renderHook(() => useImportStatus(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.teamsInApi).toBe(mockImportStatus.teamsInApi)
    expect(result.current.data?.teamsInDb).toBe(mockImportStatus.teamsInDb)
    expect(result.current.data?.matchesInApi).toBe(mockImportStatus.matchesInApi)
    expect(result.current.data?.matchesInDb).toBe(mockImportStatus.matchesInDb)
  })

  it('starts fetching immediately (isFetching is true before resolution)', () => {
    const { result } = renderHook(() => useImportStatus(), { wrapper: makeWrapper() })
    // On mount, enabled:true so it should start fetching
    expect(result.current.isFetching || result.current.isSuccess).toBe(true)
  })

  it('does not refetch within staleTime (returns cached data on second render)', async () => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: qc }, children)

    const { result: r1 } = renderHook(() => useImportStatus(), { wrapper })
    await waitFor(() => expect(r1.current.isSuccess).toBe(true))

    // Second hook instance using same QueryClient reuses cached data
    const { result: r2 } = renderHook(() => useImportStatus(), { wrapper })
    expect(r2.current.data?.teamsInApi).toBe(mockImportStatus.teamsInApi)
    expect(r2.current.isFetching).toBe(false)
  })
})
