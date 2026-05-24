import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockLeaveGroup = vi.fn()
vi.mock('@/services/groups.service', () => ({
  leaveGroup: (...args: unknown[]) => mockLeaveGroup(...args),
}))

const mockClear = vi.fn()
vi.mock('@/services/last-group.service', () => ({
  clearLastAccessedGroup: (id: string) => mockClear(id),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, isLoading: false }),
}))

import { useLeaveGroup } from '@/hooks/useLeaveGroup'

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return createElement(
    QueryClientProvider,
    { client: qc },
    createElement(MemoryRouter, null, children),
  )
}

describe('useLeaveGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('runs side-effects in order on success', async () => {
    mockLeaveGroup.mockResolvedValue({ ok: true })
    const { result } = renderHook(() => useLeaveGroup('g1'), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(mockLeaveGroup).toHaveBeenCalledWith('g1'))
    await waitFor(() => expect(mockClear).toHaveBeenCalledWith('user-1'))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }))
  })

  it('keeps modal usable on error (does not navigate)', async () => {
    mockLeaveGroup.mockRejectedValueOnce(new Error('LAST_ADMIN'))
    const { result } = renderHook(() => useLeaveGroup('g1'), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(mockClear).not.toHaveBeenCalled()
  })
})
