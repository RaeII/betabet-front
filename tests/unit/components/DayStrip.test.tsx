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

  it('does not capture the pointer before a mouse click becomes a drag', () => {
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

    const tablist = screen.getByRole('tablist', { name: /dias com partidas/i })
    const setPointerCapture = vi.fn()
    Object.defineProperty(tablist, 'setPointerCapture', {
      value: setPointerCapture,
      configurable: true,
    })
    Object.defineProperty(tablist, 'hasPointerCapture', {
      value: vi.fn(() => false),
      configurable: true,
    })

    const pills = screen.getAllByRole('button', { name: /Selecionar dia/ })
    fireEvent.pointerDown(pills[1], {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 40,
    })
    fireEvent.pointerUp(pills[1], {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 40,
    })
    fireEvent.click(pills[1])

    expect(setPointerCapture).not.toHaveBeenCalled()
    expect(onSelect).toHaveBeenCalledWith('2026-06-17')
  })

  it('does not render past-day toggle button anymore', () => {
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
    expect(screen.queryByRole('button', { name: /ver dias passados/i })).not.toBeInTheDocument()
  })

  it('shows and hides left/right indicators based on scroll position', () => {
    render(
      <DayStrip
        matches={[
          makeMatch('2026-06-10T18:00:00', 'finished'),
          makeMatch('2026-06-11T18:00:00', 'finished'),
          makeMatch('2026-06-16T18:00:00'),
          makeMatch('2026-06-17T18:00:00'),
        ]}
        selectedDate="2026-06-16"
        onSelectDate={vi.fn()}
      />,
    )

    const tablist = screen.getByRole('tablist', { name: /dias com partidas/i })
    Object.defineProperty(tablist, 'clientWidth', { value: 120, configurable: true })
    Object.defineProperty(tablist, 'scrollWidth', { value: 360, configurable: true })
    Object.defineProperty(tablist, 'scrollLeft', { value: 0, writable: true, configurable: true })

    fireEvent(window, new Event('resize'))
    expect(screen.queryByTestId('daystrip-hidden-left')).not.toBeInTheDocument()
    expect(screen.getByTestId('daystrip-hidden-right')).toBeInTheDocument()

    tablist.scrollLeft = 80
    fireEvent.scroll(tablist)
    expect(screen.getByTestId('daystrip-hidden-left')).toBeInTheDocument()
    expect(screen.getByTestId('daystrip-hidden-right')).toBeInTheDocument()

    tablist.scrollLeft = 240
    fireEvent.scroll(tablist)
    expect(screen.getByTestId('daystrip-hidden-left')).toBeInTheDocument()
    expect(screen.queryByTestId('daystrip-hidden-right')).not.toBeInTheDocument()
  })

  it('scrolls when clicking the hidden-day arrows', () => {
    render(
      <DayStrip
        matches={[
          makeMatch('2026-06-10T18:00:00', 'finished'),
          makeMatch('2026-06-11T18:00:00', 'finished'),
          makeMatch('2026-06-16T18:00:00'),
          makeMatch('2026-06-17T18:00:00'),
        ]}
        selectedDate="2026-06-16"
        onSelectDate={vi.fn()}
      />,
    )

    const tablist = screen.getByRole('tablist', { name: /dias com partidas/i })
    Object.defineProperty(tablist, 'clientWidth', { value: 120, configurable: true })
    Object.defineProperty(tablist, 'scrollWidth', { value: 360, configurable: true })
    Object.defineProperty(tablist, 'scrollLeft', { value: 0, writable: true, configurable: true })
    Object.defineProperty(tablist, 'scrollBy', {
      value: vi.fn(({ left }: ScrollToOptions) => {
        tablist.scrollLeft += left ?? 0
      }),
      configurable: true,
    })

    fireEvent(window, new Event('resize'))
    fireEvent.click(screen.getByRole('button', { name: /mostrar próximos dias/i }))

    expect(tablist.scrollLeft).toBeGreaterThan(0)

    tablist.scrollLeft = 120
    fireEvent.scroll(tablist)
    fireEvent.click(screen.getByRole('button', { name: /mostrar dias anteriores/i }))

    expect(tablist.scrollLeft).toBeLessThan(120)
  })
})
