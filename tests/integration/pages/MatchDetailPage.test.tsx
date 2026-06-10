import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { MatchDetailPage } from '@/pages/match-detail/MatchDetailPage'
import { useGroupMatches } from '@/hooks/useGroupMatches'
import {
  useMatch,
  useMatchDistribution,
  useMatchLive,
  useMatchPostMatch,
  useMatchPreview,
} from '@/hooks/useMatches'
import type { MatchWithUserBet } from '@/types/match.types'
import type { MatchLive } from '@/services/liveMatch.service'

vi.mock('@/hooks/useGroupMatches', () => ({ useGroupMatches: vi.fn() }))
vi.mock('@/hooks/useMatches', () => ({
  useMatch: vi.fn(),
  useMatchDistribution: vi.fn(),
  useMatchLive: vi.fn(),
  useMatchPostMatch: vi.fn(),
  useMatchPreview: vi.fn(),
}))
vi.mock('@/hooks/useLiveMatchNotifications', () => ({ useLiveMatchNotifications: vi.fn() }))
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
          showBetsBeforeKickoff: true,
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
vi.mock('@/hooks/useMatchPoints', () => ({
  useMatchMyPoints: vi.fn(() => ({
    data: {
      state: 'live',
      bet: { homeScore: 4, awayScore: 3 },
      liveScore: { home: 1, away: 0 },
      matchPoints: { result: 1, exactScore: 1, total: 2, confirmed: false },
      totalBeforeMatch: 10,
      totalWithMatch: 12,
    },
  })),
}))

const mockedGroupMatches = useGroupMatches as ReturnType<typeof vi.fn>
const mockedUseMatch = useMatch as ReturnType<typeof vi.fn>
const mockedDistribution = useMatchDistribution as ReturnType<typeof vi.fn>
const mockedLive = useMatchLive as ReturnType<typeof vi.fn>
const mockedPostMatch = useMatchPostMatch as ReturnType<typeof vi.fn>
const mockedPreview = useMatchPreview as ReturnType<typeof vi.fn>

function makeMatch(
  homeScore: number,
  awayScore: number,
  overrides: Partial<MatchWithUserBet> = {},
): MatchWithUserBet {
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
      replicate: false,
      createdAt: '',
      updatedAt: '',
    },
    ...overrides,
  }
}

function makeLive(overrides: Partial<MatchLive> = {}): MatchLive {
  return {
    matchId: 'm-1',
    hasApiFixtureId: true,
    isLive: true,
    status: { short: '1H', long: 'First Half', elapsed: 10, extra: null },
    goals: { home: 1, away: 0 },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
    league: null,
    venue: null,
    referee: null,
    teams: null,
    events: [],
    lineups: [],
    statistics: [],
    cachedAt: null,
    staleAt: null,
    ...overrides,
  }
}

function createPageUi(qc: QueryClient) {
  return createElement(
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
  )
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const ui = createPageUi(qc)

  return { ...render(ui), qc }
}

describe('MatchDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedDistribution.mockReturnValue({ data: undefined })
    mockedLive.mockReturnValue({ data: undefined })
    mockedPostMatch.mockReturnValue({ data: undefined })
    mockedPreview.mockReturnValue({ data: undefined })
    mockedUseMatch.mockReturnValue({
      data: makeMatch(1, 0),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    mockedGroupMatches.mockReturnValue({
      data: { matches: [makeMatch(4, 3)] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses the group-scoped match bet when rendering a group match detail', () => {
    renderPage()

    expect(mockedUseMatch).toHaveBeenCalledWith('m-1', false)
    expect(screen.getByText('Seu palpite')).toBeInTheDocument()
    expect(screen.getByText((_, element) => element?.textContent === '4 × 3')).toBeInTheDocument()
  })

  it('refreshes at kickoff and renders the points badge after the match starts', () => {
    vi.useFakeTimers()
    const scheduledAt = new Date(Date.now() + 1_000).toISOString()
    const upcomingMatch = makeMatch(4, 3, { scheduledAt })
    const liveMatch = makeMatch(4, 3, {
      scheduledAt,
      status: 'live',
      homeScore: 1,
      awayScore: 0,
    })
    let currentMatch = upcomingMatch
    const refetch = vi.fn(() => {
      currentMatch = liveMatch
      return Promise.resolve({ data: { matches: [currentMatch] } })
    })

    mockedGroupMatches.mockImplementation(() => ({
      data: { matches: [currentMatch] },
      isLoading: false,
      isError: false,
      refetch,
    }))

    const view = renderPage()
    expect(screen.queryByText('+2 pts')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1_000)
    })
    act(() => {
      view.rerender(createPageUi(view.qc))
    })

    expect(refetch).toHaveBeenCalled()
    expect(screen.getByText((_, element) => element?.textContent === '+2pts')).toBeInTheDocument()
  })

  it('treats upstream NS as scheduled even when the internal status is live', () => {
    const scheduledAt = new Date(Date.now() + 20 * 60_000).toISOString()
    mockedGroupMatches.mockReturnValue({
      data: {
        matches: [
          makeMatch(4, 3, {
            scheduledAt,
            status: 'live',
            homeScore: null,
            awayScore: null,
          }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    mockedLive.mockReturnValue({
      data: makeLive({
        isLive: false,
        status: { short: 'NS', long: 'Not Started', elapsed: null, extra: null },
        goals: { home: null, away: null },
      }),
    })

    renderPage()

    expect(screen.queryByText('Not Started')).not.toBeInTheDocument()
    expect(screen.queryByText(/Ao vivo/i)).not.toBeInTheDocument()
    expect(screen.getByText('Em breve')).toBeInTheDocument()
    expect(screen.getByText('Seu palpite')).toBeInTheDocument()
    expect(screen.queryByText('Pontos com a partida')).not.toBeInTheDocument()
  })
})
