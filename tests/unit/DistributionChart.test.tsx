import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { createElement } from 'react'
import { DistributionChart } from '@/pages/match-detail/components/DistributionChart'

const mockData = {
  matchId: 'match-1',
  homePct: 60,
  drawPct: 20,
  awayPct: 20,
  totalBets: 100,
}

describe('DistributionChart', () => {
  it('renders all three bars with correct percentages', () => {
    render(
      createElement(DistributionChart, {
        data: mockData,
        homeTeamName: 'Brasil',
        awayTeamName: 'Argentina',
      }),
      { wrapper: ({ children }) => createElement(MemoryRouter, null, children) },
    )

    expect(screen.getByText('Brasil')).toBeInTheDocument()
    expect(screen.getByText('Empate')).toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.getByText('100 apostas')).toBeInTheDocument()
  })

  it('displays correct percentage values', () => {
    render(
      createElement(DistributionChart, {
        data: mockData,
        homeTeamName: 'Brasil',
        awayTeamName: 'Argentina',
      }),
      { wrapper: ({ children }) => createElement(MemoryRouter, null, children) },
    )

    // formatPct(60) = '60%', formatPct(20) = '20%'
    const pcts = screen.getAllByText(/\d+%/)
    const values = pcts.map(el => el.textContent)
    expect(values).toContain('60%')
    expect(values).toContain('20%')
  })
})
