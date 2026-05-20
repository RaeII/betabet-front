import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { HomePage } from '@/pages/home/HomePage'
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

describe('HomePage', () => {
  beforeEach(() => server.use(...matchesHandlers))

  it('renders upcoming matches section', async () => {
    render(createElement(HomePage), { wrapper: makeWrapper() })

    await waitFor(() => expect(screen.getByText(/próximos jogos/i)).toBeInTheDocument())
  })

  it('renders unbetted matches section', async () => {
    render(createElement(HomePage), { wrapper: makeWrapper() })

    await waitFor(() => expect(screen.getByText(/aposte agora/i)).toBeInTheDocument())
  })
})
