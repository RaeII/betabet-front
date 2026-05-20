import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { MatchesPage } from '@/pages/matches/MatchesPage'
import { server } from '../../mocks/server'
import { matchesHandlers } from './matches.handlers'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(MemoryRouter, null, children),
    )
}

describe('MatchesPage', () => {
  beforeEach(() => server.use(...matchesHandlers))

  it('renders group stage tab and match cards', async () => {
    render(createElement(MatchesPage), { wrapper: makeWrapper() })

    await waitFor(() => expect(screen.getByText('Brasil')).toBeInTheDocument())
    expect(screen.getByText('Argentina')).toBeInTheDocument()
  })

  it('renders phase selector tabs', async () => {
    render(createElement(MatchesPage), { wrapper: makeWrapper() })

    expect(screen.getByText(/fase de grupos/i)).toBeInTheDocument()
    expect(screen.getByText(/mata-mata/i)).toBeInTheDocument()
  })
})
