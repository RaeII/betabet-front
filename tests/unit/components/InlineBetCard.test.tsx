import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

const placeMutate = vi.fn()
const editMutate = vi.fn()

vi.mock('@/hooks/useBets', () => ({
  usePlaceBet: () => ({
    mutate: placeMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
  useEditBet: () => ({
    mutate: editMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}))

import { InlineBetCard } from '@/pages/home/components/InlineBetCard'
import type { MatchWithUserBet } from '@/types/match.types'

const baseTeam = { id: 't', name: 'Brasil', flagUrl: '', group: null }
const baseStadium = { id: 's', name: 'Nacional', city: 'BSB' }

function makeMatch(overrides: Partial<MatchWithUserBet> = {}): MatchWithUserBet {
  const future = new Date(Date.now() + 24 * 60 * 60_000).toISOString()
  return {
    id: 'm-1',
    homeTeam: baseTeam,
    awayTeam: { ...baseTeam, name: 'Argentina' },
    stadium: baseStadium,
    scheduledAt: future,
    status: 'upcoming',
    phase: 'group',
    groupName: null,
    matchday: null,
    homeScore: null,
    awayScore: null,
    userBet: null,
    ...overrides,
  }
}

function renderCard(match: MatchWithUserBet) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(InlineBetCard, { match, groupId: 'g1' }),
    ),
  )
}

describe('InlineBetCard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders two numeric inputs and disables save while empty', () => {
    renderCard(makeMatch())
    const inputs = screen.getAllByLabelText(/Palpite /)
    expect(inputs).toHaveLength(2)
    inputs.forEach(i => expect(i).toHaveAttribute('inputmode', 'numeric'))

    const saveBtn = screen.getByRole('button', { name: /Salvar palpite/i })
    expect(saveBtn).toBeDisabled()
  })

  it('calls placeBet when saving for a match without bet', () => {
    renderCard(makeMatch())
    const [home, away] = screen.getAllByLabelText(/Palpite /)
    fireEvent.change(home, { target: { value: '2' } })
    fireEvent.change(away, { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /Salvar palpite/i }))
    expect(placeMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        matchId: 'm-1',
        groupId: 'g1',
        homeScore: 2,
        awayScore: 1,
      }),
    )
  })

  it('renders "Palpite salvo" badge when match already has a bet', () => {
    renderCard(
      makeMatch({
        userBet: {
          id: 'b1',
          matchId: 'm-1',
          userId: 'u',
          groupId: 'g1',
          homeScore: 3,
          awayScore: 2,
          resultPoints: null,
          exactScorePoints: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    )
    expect(screen.getByText(/Palpite salvo/i)).toBeInTheDocument()
  })

  it('locks input when match is finished', () => {
    renderCard(makeMatch({ status: 'finished' }))
    expect(screen.getByText(/Apostas encerradas/i)).toBeInTheDocument()
  })
})
