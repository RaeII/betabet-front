import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/hooks/useActiveGroup', () => ({
  useActiveGroup: () => ({
    groupId: 'g1',
    group: {
      id: 'g1',
      name: 'Bolão',
      emoji: null,
      coverUrl: null,
      adminId: 'u',
      resultPoints: 1,
      exactScorePoints: 3,
      showBetsBeforeKickoff: true,
      joinMode: 'request',
      memberCount: 1,
      inviteCode: 'X',
      createdAt: new Date().toISOString(),
    },
    role: 'member',
    isAdmin: false,
  }),
}))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u', name: 'Israel Silva' }, isLoading: false }),
}))

const matchesResp = {
  matches: [
    {
      id: 'm-today',
      homeTeam: { id: 't1', name: 'Brasil', flagUrl: '', group: null },
      awayTeam: { id: 't2', name: 'Argentina', flagUrl: '', group: null },
      stadium: { id: 's', name: 'X', city: 'C' },
      scheduledAt: '2026-06-15T20:00:00',
      status: 'upcoming',
      phase: 'group',
      groupName: null,
      matchday: null,
      homeScore: null,
      awayScore: null,
      userBet: null,
    },
    {
      id: 'm-yesterday',
      homeTeam: { id: 't1', name: 'França', flagUrl: '', group: null },
      awayTeam: { id: 't2', name: 'Espanha', flagUrl: '', group: null },
      stadium: { id: 's', name: 'X', city: 'C' },
      scheduledAt: '2026-06-14T20:00:00',
      status: 'finished',
      phase: 'group',
      groupName: null,
      matchday: null,
      homeScore: 1,
      awayScore: 1,
      userBet: null,
    },
  ],
}

vi.mock('@/hooks/useGroupMatches', () => ({
  useGroupMatches: () => ({
    data: matchesResp,
    isLoading: false,
    isError: false,
  }),
}))

import { HomePage } from '@/pages/home/HomePage'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(MemoryRouter, null, children),
    )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('renders greeting and the day strip', () => {
    render(createElement(HomePage), { wrapper: makeWrapper() })
    expect(screen.getByText(/Olá, Israel/i)).toBeInTheDocument()
    expect(screen.getByRole('tablist', { name: /Dias com partidas/i })).toBeInTheDocument()
  })

  it('hides past-only days by default', () => {
    render(createElement(HomePage), { wrapper: makeWrapper() })
    // Today (2026-06-15) is visible
    expect(screen.queryByText(/França/)).not.toBeInTheDocument()
    expect(screen.getByText(/Brasil/)).toBeInTheDocument()
  })
})
