import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FinishedMatchCard } from '@/pages/home/components/FinishedMatchCard'
import type { MatchWithUserBet } from '@/types/match.types'

const baseTeam = { id: 't', name: 'BR', flagUrl: '', group: null }
const baseStadium = { id: 's', name: 'X', city: 'C' }
const group = { resultPoints: 1, exactScorePoints: 3 }

function makeMatch(overrides: Partial<MatchWithUserBet> = {}): MatchWithUserBet {
  return {
    id: 'm-1',
    homeTeam: { ...baseTeam, name: 'Brasil' },
    awayTeam: { ...baseTeam, name: 'Argentina' },
    stadium: baseStadium,
    scheduledAt: new Date('2026-06-14T20:00:00').toISOString(),
    status: 'finished',
    phase: 'group',
    groupName: null,
    matchday: null,
    homeScore: 2,
    awayScore: 1,
    userBet: null,
    ...overrides,
  }
}

describe('FinishedMatchCard', () => {
  it('renders official score, bet, and points when match has bet', () => {
    render(
      <FinishedMatchCard
        match={makeMatch({
          userBet: {
            id: 'b',
            matchId: 'm-1',
            userId: 'u',
            groupId: 'g',
            homeScore: 2,
            awayScore: 1,
            resultPoints: 1,
            exactScorePoints: 3,
            createdAt: '',
            updatedAt: '',
          },
        })}
        group={group}
      />,
    )
    expect(screen.getByText(/Seu palpite:/)).toBeInTheDocument()
    expect(screen.getByText(/4 pontos/)).toBeInTheDocument()
  })

  it('shows "Você não palpitou" when no bet', () => {
    render(<FinishedMatchCard match={makeMatch({ userBet: null })} group={group} />)
    expect(screen.getByText(/Você não palpitou/i)).toBeInTheDocument()
  })

  it('shows "Resultado pendente" when official scores missing', () => {
    render(
      <FinishedMatchCard
        match={makeMatch({ homeScore: null, awayScore: null })}
        group={group}
      />,
    )
    expect(screen.getByText(/Resultado pendente/i)).toBeInTheDocument()
  })
})
