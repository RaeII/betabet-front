import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BettingProgressBar } from '@/pages/home/components/BettingProgressBar'

describe('BettingProgressBar', () => {
  it('renders percentage label and progressbar role', () => {
    render(
      <BettingProgressBar
        progress={{ betted: 2, total: 4, pct: 50, isComplete: false }}
      />,
    )
    expect(screen.getByText(/2 de 4 palpites/i)).toBeInTheDocument()
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '50')
  })

  it('renders nothing when total === 0', () => {
    const { container } = render(
      <BettingProgressBar
        progress={{ betted: 0, total: 0, pct: 0, isComplete: false }}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows completion state when isComplete=true', () => {
    render(
      <BettingProgressBar
        progress={{ betted: 4, total: 4, pct: 100, isComplete: true }}
      />,
    )
    expect(screen.getByText(/Todos os palpites do dia/i)).toBeInTheDocument()
  })
})
