import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { server } from '../../mocks/server'
import { useGroupMatches } from '@/hooks/useGroupMatches'
import { groupKeys } from '@/hooks/useGroups'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

const sampleResponse = {
  matches: [
    {
      id: 'match-1',
      homeTeam: { id: 't1', name: 'BR', flagUrl: '', group: null },
      awayTeam: { id: 't2', name: 'AR', flagUrl: '', group: null },
      stadium: { id: 's', name: 'X', city: 'C' },
      scheduledAt: new Date(Date.now() + 60 * 60_000).toISOString(),
      status: 'upcoming',
      phase: 'group',
      groupName: null,
      matchday: null,
      homeScore: null,
      awayScore: null,
      userBet: null,
    },
  ],
}

describe('useGroupMatches', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/groups/g1/matches', () => HttpResponse.json(sampleResponse)),
    )
  })

  it('fetches matches and exposes the group matches key', async () => {
    expect(groupKeys.matches('g1')).toEqual(['groups', 'matches', 'g1'])

    const { result } = renderHook(() => useGroupMatches('g1'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.matches).toHaveLength(1)
    expect(result.current.data?.matches[0].id).toBe('match-1')
  })
})
