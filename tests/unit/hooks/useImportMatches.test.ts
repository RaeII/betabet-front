import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useImportMatches } from '@/hooks/useImportMatches'
import { server } from '../../mocks/server'
import { importHandlers } from '../../mocks/handlers/import.handlers'

vi.mock('@/context/toast.context', () => ({
  useToast: () => vi.fn(),
}))

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useImportMatches', () => {
  beforeEach(() => server.use(...importHandlers))

  it('does not fetch preview automatically (enabled: false)', () => {
    const { result } = renderHook(() => useImportMatches(), { wrapper: makeWrapper() })
    expect(result.current.preview.isFetching).toBe(false)
    expect(result.current.preview.data).toBeUndefined()
  })

  it('loads matches preview when refetch is called', async () => {
    const { result } = renderHook(() => useImportMatches(), { wrapper: makeWrapper() })

    act(() => { void result.current.preview.refetch() })

    await waitFor(() => expect(result.current.preview.isSuccess).toBe(true))
    expect(result.current.preview.data?.matches).toHaveLength(2)
  })

  it('saveOne mutation succeeds for eligible match', async () => {
    const { result } = renderHook(() => useImportMatches(), { wrapper: makeWrapper() })

    act(() => { result.current.saveOne.mutate(1035050) })

    await waitFor(() => expect(result.current.saveOne.isSuccess).toBe(true))
    expect(result.current.saveOne.data?.created).toBe(1)
  })

  it('saveOne flips exists flag in preview cache via setQueryData', async () => {
    const { result } = renderHook(() => useImportMatches(), { wrapper: makeWrapper() })

    act(() => { void result.current.preview.refetch() })
    await waitFor(() => expect(result.current.preview.isSuccess).toBe(true))

    const beforeSave = result.current.preview.data?.matches.find(m => m.apiFixtureId === 1035050)
    expect(beforeSave?.exists).toBe(false)

    act(() => { result.current.saveOne.mutate(1035050) })
    await waitFor(() => expect(result.current.saveOne.isSuccess).toBe(true))

    const afterSave = result.current.preview.data?.matches.find(m => m.apiFixtureId === 1035050)
    expect(afterSave?.exists).toBe(true)
  })

  it('saveAll mutation succeeds and returns ImportResult', async () => {
    const { result } = renderHook(() => useImportMatches(), { wrapper: makeWrapper() })

    act(() => { result.current.saveAll.mutate() })

    await waitFor(() => expect(result.current.saveAll.isSuccess).toBe(true))
    expect(result.current.saveAll.data?.created).toBe(1)
  })

  it('newCount returns count of matches where exists is false', async () => {
    const { result } = renderHook(() => useImportMatches(), { wrapper: makeWrapper() })

    act(() => { void result.current.preview.refetch() })
    await waitFor(() => expect(result.current.preview.isSuccess).toBe(true))

    // both mockMatches have exists: false
    expect(result.current.newCount).toBe(2)
  })
})
