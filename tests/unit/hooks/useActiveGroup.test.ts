import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/hooks/useGroups', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useGroups')>('@/hooks/useGroups')
  return {
    ...actual,
    useGroup: vi.fn(),
    useUserGroups: vi.fn(),
  }
})
vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('@/services/last-group.service', () => ({
  setLastAccessedGroup: vi.fn(),
  getLastAccessedGroup: vi.fn(),
  clearLastAccessedGroup: vi.fn(),
}))

import { useGroup, useUserGroups } from '@/hooks/useGroups'
import { useAuth } from '@/hooks/useAuth'
import { setLastAccessedGroup } from '@/services/last-group.service'
import { useActiveGroup } from '@/hooks/useActiveGroup'

const mockedUseGroup = useGroup as ReturnType<typeof vi.fn>
const mockedUseUserGroups = useUserGroups as ReturnType<typeof vi.fn>
const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>
const mockedSetLast = setLastAccessedGroup as ReturnType<typeof vi.fn>

const baseGroup = {
  id: 'group-a',
  name: 'A',
  emoji: null,
  coverUrl: null,
  adminId: 'u',
  resultPoints: 1,
  exactScorePoints: 3,
  showBetsBeforeKickoff: false,
  joinMode: 'request' as const,
  memberCount: 1,
  inviteCode: 'X',
  createdAt: new Date().toISOString(),
}

function wrap(groupId: string) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        MemoryRouter,
        { initialEntries: [`/groups/${groupId}`] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/groups/:groupId',
            element: children,
          }),
        ),
      ),
    )
  }
}

describe('useActiveGroup', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({ user: { id: 'user-1' }, isLoading: false })
    mockedUseUserGroups.mockReturnValue({ data: { groups: [baseGroup] } })
  })

  afterEach(() => vi.clearAllMocks())

  it('writes lastAccessedGroup when groupId changes via URL', () => {
    mockedUseGroup.mockReturnValue({ data: { group: baseGroup, role: 'member' } })
    renderHook(() => useActiveGroup(), { wrapper: wrap('group-a') })
    expect(mockedSetLast).toHaveBeenCalledWith('user-1', 'group-a')
  })

  it('returns null group when group not loaded yet', () => {
    mockedUseGroup.mockReturnValue({ data: undefined })
    mockedUseUserGroups.mockReturnValue({ data: { groups: [] } })

    const { result } = renderHook(() => useActiveGroup(), { wrapper: wrap('unknown') })
    expect(result.current.group).toBeNull()
    expect(result.current.role).toBeNull()
    expect(result.current.isAdmin).toBe(false)
  })

  it('derives isAdmin from role', () => {
    mockedUseGroup.mockReturnValue({ data: { group: baseGroup, role: 'admin' } })
    const { result } = renderHook(() => useActiveGroup(), { wrapper: wrap('group-a') })
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.role).toBe('admin')
  })
})
