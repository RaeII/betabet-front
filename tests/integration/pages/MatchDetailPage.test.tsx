import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { MatchDetailPage } from '@/pages/match-detail/MatchDetailPage'
import { useGroupMatches } from '@/hooks/useGroupMatches'
import { useMatch, useMatchDistribution } from '@/hooks/useMatches'
import type { MatchWithUserBet } from '@/types/match.types'

vi.mock('@/hooks/useGroupMatches', () => ({ useGroupMatches: vi.fn() }))
vi.mock('@/hooks/useMatches', () => ({
  useMatch: vi.fn(),
  useMatchDistribution: vi.fn(),
}))
vi.mock('@/hooks/useGroups', () => ({
  useUserGroups: () => ({
    data: {
      groups: [
        {
          id: 'g2',
          name: 'Grupo atual',
          emoji: null,
          coverUrl: null,
          adminId: 'u',
          resultPoints: 1,
          exactScorePoints: 3,
          showBetsBeforeKickoff: false,
          joinMode: 'request',
          memberCount: 1,
          inviteCode: 'X',
          createdAt: '',
        },
      ],
    },
  }),
}))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u', name: 'User', chartUnlocked: false } }),
}))
vi.mock('@/services/bets.service', () => ({
  getGroupMatchBets: vi.fn().mockResolvedValue({ bets: [], canView: true }),
}))

const mockedGroupMatches = useGroupMatches as ReturnType<typeof vi.fn>
const mockedUseMatch = useMatch as ReturnType<typeof vi.fn>
const mockedDistribution = useMatchDistribution as ReturnType<typeof vi.fn>

function makeMatch(homeScore: number, awayScore: number): MatchWithUserBet {
  return {
    id: 'm-1',
    homeTeam: { id: 't1', name: 'Brasil', flagUrl: '', flagVersion: null, group: null },
    awayTeam: { id: 't2', name: 'Argentina', flagUrl: '', flagVersion: null, group: null },
    stadium: { id: 's1', name: 'Nacional', city: 'Brasilia' },
    scheduledAt: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
    status: 'upcoming',
    phase: 'group',
    groupName: null,
    matchday: null,
    homeScore: null,
    awayScore: null,
    userBet: {
      id: `bet-${homeScore}-${awayScore}`,
      matchId: 'm-1',
      userId: 'u',
      groupId: 'g2',
      homeScore,
      awayScore,
      resultPoints: null,
      exactScorePoints: null,
      createdAt: '',
      updatedAt: '',
    },
  }
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        MemoryRouter,
        { initialEntries: ['/groups/g2/matches/m-1'] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/groups/:groupId/matches/:matchId',
            element: createElement(MatchDetailPage),
          }),
        ),
      ),
    ),
  )
}

describe('MatchDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedDistribution.mockReturnValue({ data: undefined })
    mockedUseMatch.mockReturnValue({
      data: makeMatch(1, 0),
      isLoading: false,
      isError: false,
    })
    mockedGroupMatches.mockReturnValue({
      data: { matches: [makeMatch(4, 3)] },
      isLoading: false,
      isError: false,
    })
  })

  it('uses the group-scoped match bet when rendering a group match detail', () => {
    renderPage()

    expect(mockedUseMatch).toHaveBeenCalledWith('m-1', false)
    expect(screen.getByLabelText('Casa')).toHaveDisplayValue('4')
    expect(screen.getByLabelText('Fora')).toHaveDisplayValue('3')
  })
})
