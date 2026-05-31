import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DayMatchList } from '@/pages/home/components/DayMatchList'
import type { BettingGroup } from '@/types/group.types'
import type { MatchWithUserBet } from '@/types/match.types'

vi.mock('@/pages/home/components/InlineBetCard', () => ({
  InlineBetCard: ({ match }: { match: MatchWithUserBet }) => (
    <article data-testid="match-card">{match.homeTeam.name}</article>
  ),
}))

const baseTeam = { id: 't', name: 'Time', flagUrl: '', group: null }
const baseStadium = { id: 's', name: 'Estadio', city: 'Cidade' }
const group: BettingGroup = {
  id: 'g1',
  name: 'Bolao',
  emoji: null,
  coverUrl: null,
  adminId: 'u1',
  resultPoints: 1,
  exactScorePoints: 3,
  showBetsBeforeKickoff: true,
  joinMode: 'request',
  memberCount: 1,
  inviteCode: 'ABC',
  createdAt: '2026-06-01T00:00:00.000Z',
}

function makeMatch(overrides: Partial<MatchWithUserBet>): MatchWithUserBet {
  return {
    id: overrides.id ?? 'm1',
    homeTeam: { ...baseTeam, name: overrides.homeTeam?.name ?? 'Brasil' },
    awayTeam: { ...baseTeam, name: 'Argentina' },
    stadium: baseStadium,
    scheduledAt: overrides.scheduledAt ?? '2026-06-15T20:00:00.000Z',
    status: overrides.status ?? 'upcoming',
    phase: 'group',
    groupName: null,
    matchday: null,
    homeScore: null,
    awayScore: null,
    userBet: null,
    ...overrides,
  }
}

describe('DayMatchList', () => {
  it('keeps live matches first, then nearest upcoming matches, then finished matches', () => {
    render(
      <DayMatchList
        group={group}
        matches={[
          makeMatch({
            id: 'late',
            homeTeam: { ...baseTeam, name: 'Jogo das 20h' },
            scheduledAt: '2026-06-15T20:00:00.000Z',
          }),
          makeMatch({
            id: 'live',
            homeTeam: { ...baseTeam, name: 'Ao vivo' },
            scheduledAt: '2026-06-15T19:00:00.000Z',
            status: 'live',
          }),
          makeMatch({
            id: 'early',
            homeTeam: { ...baseTeam, name: 'Jogo das 16h' },
            scheduledAt: '2026-06-15T16:00:00.000Z',
          }),
          makeMatch({
            id: 'finished',
            homeTeam: { ...baseTeam, name: 'Encerrado' },
            scheduledAt: '2026-06-15T14:00:00.000Z',
            status: 'finished',
          }),
        ]}
      />,
    )

    expect(screen.getAllByTestId('match-card').map(card => card.textContent)).toEqual([
      'Ao vivo',
      'Jogo das 16h',
      'Jogo das 20h',
      'Encerrado',
    ])
  })
})
