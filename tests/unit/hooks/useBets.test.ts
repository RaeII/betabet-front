import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { usePlaceBet, useEditBet } from '@/hooks/useBets'
import { server } from '../../mocks/server'
import { betsHandlers } from './bets.handlers'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('usePlaceBet', () => {
  beforeEach(() => server.use(...betsHandlers))

  it('calls POST /api/bets and resolves with the created bet', async () => {
    const { result } = renderHook(() => usePlaceBet(), { wrapper: makeWrapper() })

    act(() => {
      result.current.mutate({
        matchId: 'match-1',
        groupId: 'group-1',
        homeScore: 2,
        awayScore: 0,
        replicateToAllGroups: false,
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.bets[0].homeScore).toBe(2)
    expect(result.current.data?.bets[0].awayScore).toBe(0)
  })
})

describe('useEditBet', () => {
  beforeEach(() => server.use(...betsHandlers))

  it('calls PUT /api/bets/:betId and resolves with updated bet', async () => {
    const { result } = renderHook(() => useEditBet('match-1'), { wrapper: makeWrapper() })

    act(() => {
      result.current.mutate({ betId: 'bet-1', homeScore: 3, awayScore: 1 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.bet.homeScore).toBe(3)
  })
})
