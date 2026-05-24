import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLastAccessedGroup } from '@/hooks/useLastAccessedGroup'
import * as lastGroupService from '@/services/last-group.service'

vi.mock('@/hooks/useGroups', () => ({
  useUserGroups: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useUserGroups } from '@/hooks/useGroups'
import { useAuth } from '@/hooks/useAuth'

const mockedUseUserGroups = useUserGroups as ReturnType<typeof vi.fn>
const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>

const mockUser = { id: 'user-1' }

const makeGroup = (id: string) => ({
  id,
  name: id,
  emoji: null,
  coverUrl: null,
  adminId: 'user-1',
  resultPoints: 1,
  exactScorePoints: 3,
  showBetsBeforeKickoff: false,
  joinMode: 'request' as const,
  memberCount: 1,
  inviteCode: 'X',
  createdAt: new Date().toISOString(),
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useLastAccessedGroup', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({ user: mockUser, isLoading: false })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns reason "none" with 0 groups', () => {
    mockedUseUserGroups.mockReturnValue({ data: { groups: [] }, isLoading: false })

    const { result } = renderHook(() => useLastAccessedGroup(), { wrapper })

    expect(result.current).toEqual({ groupId: null, isReady: true, reason: 'none' })
  })

  it('returns reason "single" with 1 group regardless of storage', () => {
    vi.spyOn(lastGroupService, 'getLastAccessedGroup').mockReturnValue('other-id')
    mockedUseUserGroups.mockReturnValue({
      data: { groups: [makeGroup('group-only')] },
      isLoading: false,
    })

    const { result } = renderHook(() => useLastAccessedGroup(), { wrapper })

    expect(result.current).toEqual({
      groupId: 'group-only',
      isReady: true,
      reason: 'single',
    })
  })

  it('returns reason "stored" when lastId is in groups', () => {
    vi.spyOn(lastGroupService, 'getLastAccessedGroup').mockReturnValue('g2')
    mockedUseUserGroups.mockReturnValue({
      data: { groups: [makeGroup('g1'), makeGroup('g2'), makeGroup('g3')] },
      isLoading: false,
    })

    const { result } = renderHook(() => useLastAccessedGroup(), { wrapper })

    expect(result.current).toEqual({ groupId: 'g2', isReady: true, reason: 'stored' })
  })

  it('returns reason "fallback" when lastId is not in groups', () => {
    vi.spyOn(lastGroupService, 'getLastAccessedGroup').mockReturnValue('missing')
    mockedUseUserGroups.mockReturnValue({
      data: { groups: [makeGroup('g1'), makeGroup('g2')] },
      isLoading: false,
    })

    const { result } = renderHook(() => useLastAccessedGroup(), { wrapper })

    expect(result.current).toEqual({ groupId: 'g1', isReady: true, reason: 'fallback' })
  })

  it('falls back silently when localStorage throws', () => {
    vi.spyOn(lastGroupService, 'getLastAccessedGroup').mockReturnValue(null)
    mockedUseUserGroups.mockReturnValue({
      data: { groups: [makeGroup('g1'), makeGroup('g2')] },
      isLoading: false,
    })

    const { result } = renderHook(() => useLastAccessedGroup(), { wrapper })

    expect(result.current.reason).toBe('fallback')
    expect(result.current.groupId).toBe('g1')
  })
})
