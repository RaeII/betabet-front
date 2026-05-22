import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { ScoringExample } from '@/components/scoring/ScoringExample'

describe('ScoringExample', () => {
  it('renders Brasil x França match header', () => {
    render(createElement(ScoringExample, { resultPoints: 1, exactScorePoints: 3 }))
    expect(screen.getAllByText(/brasil/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/frança/i).length).toBeGreaterThan(0)
  })

  it('shows exact score scenario with exactScorePoints', () => {
    render(createElement(ScoringExample, { resultPoints: 1, exactScorePoints: 5 }))
    const rows = screen.getAllByText(/5 pontos/i)
    expect(rows.length).toBeGreaterThan(0)
  })

  it('shows winner scenario with resultPoints', () => {
    render(createElement(ScoringExample, { resultPoints: 2, exactScorePoints: 3 }))
    const rows = screen.getAllByText(/2 pontos/i)
    expect(rows.length).toBeGreaterThan(0)
  })

  it('shows wrong guess scenario with 0 points', () => {
    render(createElement(ScoringExample, { resultPoints: 1, exactScorePoints: 3 }))
    expect(screen.getByText(/0 pontos/i)).toBeInTheDocument()
  })

  it('updates in real time when props change', () => {
    const { rerender } = render(
      createElement(ScoringExample, { resultPoints: 1, exactScorePoints: 3 }),
    )
    expect(screen.getAllByText(/3 pontos/i).length).toBeGreaterThan(0)

    rerender(createElement(ScoringExample, { resultPoints: 1, exactScorePoints: 10 }))
    expect(screen.getAllByText(/10 pontos/i).length).toBeGreaterThan(0)
  })
})
