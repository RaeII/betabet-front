import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DayStrip } from '@/pages/home/components/DayStrip'
import type { MatchWithUserBet } from '@/types/match.types'

const baseTeam = { id: 't', name: 'T', flagUrl: '', group: null }
const baseStadium = { id: 's', name: 'S', city: 'C' }

function makeMatch(iso: string, status: MatchWithUserBet['status'] = 'upcoming'): MatchWithUserBet {
  return {
    id: `m-${iso}`,
    homeTeam: baseTeam,
    awayTeam: baseTeam,
    stadium: baseStadium,
    status,
    phase: 'group',
    groupName: null,
    matchday: null,
    homeScore: null,
    awayScore: null,
    userBet: null,
    scheduledAt: iso,
  }
}

describe('DayStrip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('renders pills for each upcoming matchday', () => {
    render(
      <DayStrip
        matches={[
          makeMatch('2026-06-16T18:00:00'),
          makeMatch('2026-06-17T18:00:00'),
        ]}
        selectedDate={null}
        onSelectDate={vi.fn()}
      />,
    )
    expect(screen.getAllByRole('button', { name: /Selecionar dia/ }).length).toBeGreaterThanOrEqual(2)
  })

  it('highlights the selected pill via aria-pressed', () => {
    render(
      <DayStrip
        matches={[makeMatch('2026-06-16T18:00:00')]}
        selectedDate="2026-06-16"
        onSelectDate={vi.fn()}
      />,
    )
    const pill = screen.getByRole('button', { name: /Selecionar dia/ })
    expect(pill).toHaveAttribute('aria-pressed', 'true')
  })

  it('fires onSelectDate when clicking a pill', () => {
    const onSelect = vi.fn()
    render(
      <DayStrip
        matches={[
          makeMatch('2026-06-16T18:00:00'),
          makeMatch('2026-06-17T18:00:00'),
        ]}
        selectedDate="2026-06-16"
        onSelectDate={onSelect}
      />,
    )
    const pills = screen.getAllByRole('button', { name: /Selecionar dia/ })
    fireEvent.click(pills[1])
    expect(onSelect).toHaveBeenCalledWith('2026-06-17')
  })

  it('shows toggle to include past days', () => {
    render(
      <DayStrip
        matches={[
          makeMatch('2026-06-10T18:00:00', 'finished'),
          makeMatch('2026-06-16T18:00:00'),
        ]}
        selectedDate={null}
        onSelectDate={vi.fn()}
      />,
    )
    // Default shows only upcoming; past hidden
    expect(screen.getByRole('button', { name: /ver dias passados/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /ver dias passados/i }))
    expect(screen.getByRole('button', { name: /ocultar dias passados/i })).toBeInTheDocument()
  })
})
