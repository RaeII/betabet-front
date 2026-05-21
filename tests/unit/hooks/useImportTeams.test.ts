import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useImportTeams } from '@/hooks/useImportTeams'
import { server } from '../../mocks/server'
import { importHandlers, mockTeams } from '../../mocks/handlers/import.handlers'

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

describe('useImportTeams', () => {
  beforeEach(() => server.use(...importHandlers))

  it('does not fetch preview automatically (enabled: false)', () => {
    const { result } = renderHook(() => useImportTeams(), { wrapper: makeWrapper() })
    expect(result.current.preview.isFetching).toBe(false)
    expect(result.current.preview.data).toBeUndefined()
  })

  it('loads teams preview when refetch is called', async () => {
    const { result } = renderHook(() => useImportTeams(), { wrapper: makeWrapper() })

    act(() => { void result.current.preview.refetch() })

    await waitFor(() => expect(result.current.preview.isSuccess).toBe(true))
    expect(result.current.preview.data?.teams).toHaveLength(2)
    expect(result.current.preview.data?.teams[0].name).toBe('Brazil')
  })

  it('saveOne mutation succeeds and returns ImportResult', async () => {
    const { result } = renderHook(() => useImportTeams(), { wrapper: makeWrapper() })

    act(() => { result.current.saveOne.mutate(6) })

    await waitFor(() => expect(result.current.saveOne.isSuccess).toBe(true))
    expect(result.current.saveOne.data?.created).toBe(1)
  })

  it('saveOne flips exists flag in preview cache via setQueryData', async () => {
    const { result } = renderHook(() => useImportTeams(), { wrapper: makeWrapper() })

    // Load preview first
    act(() => { void result.current.preview.refetch() })
    await waitFor(() => expect(result.current.preview.isSuccess).toBe(true))

    const beforeSave = result.current.preview.data?.teams.find(t => t.apiTeamId === 6)
    expect(beforeSave?.exists).toBe(false)

    act(() => { result.current.saveOne.mutate(6) })
    await waitFor(() => expect(result.current.saveOne.isSuccess).toBe(true))

    const afterSave = result.current.preview.data?.teams.find(t => t.apiTeamId === 6)
    expect(afterSave?.exists).toBe(true)
  })

  it('saveAll mutation succeeds and returns ImportResult', async () => {
    const { result } = renderHook(() => useImportTeams(), { wrapper: makeWrapper() })

    act(() => { result.current.saveAll.mutate() })

    await waitFor(() => expect(result.current.saveAll.isSuccess).toBe(true))
    expect(result.current.saveAll.data?.created).toBe(1)
    expect(result.current.saveAll.data?.skipped).toBe(1)
  })

  it('newCount returns count of teams where exists is false', async () => {
    const { result } = renderHook(() => useImportTeams(), { wrapper: makeWrapper() })

    act(() => { void result.current.preview.refetch() })
    await waitFor(() => expect(result.current.preview.isSuccess).toBe(true))

    // mockTeams has 1 with exists:false and 1 with exists:true
    expect(result.current.newCount).toBe(1)
  })
})

// suppress unused import warning — mockTeams used indirectly via handler
void mockTeams
