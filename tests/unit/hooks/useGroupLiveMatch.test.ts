import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { createElement } from 'react'
import { server } from '../../mocks/server'
import { useGroupHasLiveMatch } from '@/hooks/useGroupLiveMatch'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

function match(id: string, status: 'upcoming' | 'live' | 'finished' = 'live') {
  return {
    id,
    homeTeam: { id: 't1', name: 'Brasil', flagUrl: '', flagVersion: null, group: null },
    awayTeam: { id: 't2', name: 'Argentina', flagUrl: '', flagVersion: null, group: null },
    stadium: { id: 's1', name: 'Estádio', city: 'Cidade' },
    scheduledAt: new Date().toISOString(),
    status,
    phase: 'group',
    groupName: 'A',
    matchday: 1,
    homeScore: null,
    awayScore: null,
    userBet: null,
  }
}

function liveResponse(matchId: string, short: string, isLive: boolean) {
  return {
    matchId,
    hasApiFixtureId: true,
    isLive,
    status: { short, long: short, elapsed: null, extra: null },
    goals: { home: null, away: null },
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
  }
}

describe('useGroupHasLiveMatch', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/groups/g1/matches', () =>
        HttpResponse.json({ matches: [match('m-live'), match('m-terminal'), match('m-upcoming', 'upcoming')] }),
      ),
      http.get('/api/matches/m-live/live', () => HttpResponse.json(liveResponse('m-live', '2H', true))),
      http.get('/api/matches/m-terminal/live', () =>
        HttpResponse.json(liveResponse('m-terminal', 'FT', false)),
      ),
    )
  })

  it('returns true when at least one candidate is really live upstream', async () => {
    const { result } = renderHook(() => useGroupHasLiveMatch('g1'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(true))
  })

  it('stays false when database-live matches are already terminal upstream', async () => {
    let liveRequests = 0
    server.use(
      http.get('/api/groups/g1/matches', () => HttpResponse.json({ matches: [match('m-terminal')] })),
      http.get('/api/matches/m-terminal/live', () => {
        liveRequests += 1
        return HttpResponse.json(liveResponse('m-terminal', 'FT', false))
      }),
    )

    const { result } = renderHook(() => useGroupHasLiveMatch('g1'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(liveRequests).toBe(1))
    expect(result.current).toBe(false)
  })
})
