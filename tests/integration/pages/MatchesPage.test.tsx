import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('renders group stage standings and match cards', async () => {
    render(createElement(MatchesPage), { wrapper: makeWrapper() })

    await waitFor(() => expect(screen.getAllByText('Brasil').length).toBeGreaterThan(0))
    const groupAClassification = screen.getByRole('heading', {
      name: /classificação do grupo a/i,
    }).closest('section')

    expect(groupAClassification).toBeInTheDocument()
    await waitFor(() => {
      const classificationImageSources = [
        ...(groupAClassification?.querySelectorAll('img') ?? []),
      ].map(image => image.getAttribute('src') ?? '')

      expect(classificationImageSources.some(src => src.endsWith('/flags/br.svg'))).toBe(true)
      expect(classificationImageSources.some(src => src.endsWith('/api-football/br.png'))).toBe(false)
    })
    expect(screen.getAllByText('Argentina').length).toBeGreaterThan(0)
  })

  it('renders phase selector tabs', async () => {
    render(createElement(MatchesPage), { wrapper: makeWrapper() })

    expect(screen.getByText(/fase de grupos/i)).toBeInTheDocument()
    expect(screen.getByText(/mata-mata/i)).toBeInTheDocument()
  })

  it('changes only the selected group round', async () => {
    const user = userEvent.setup()
    render(createElement(MatchesPage), { wrapper: makeWrapper() })

    await screen.findByRole('heading', { name: /^grupo a$/i })
    expect(
      screen.getByRole('link', { name: /ver detalhes de brasil contra argentina/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /ver detalhes de alemanha contra espanha/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: /ver detalhes de frança contra seleção internacional de nome muito longo/i,
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ver próxima rodada do grupo a/i }))

    expect(
      screen.getByRole('link', { name: /ver detalhes de alemanha contra espanha/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /ver detalhes de brasil contra argentina/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: /ver detalhes de frança contra seleção internacional de nome muito longo/i,
      }),
    ).toBeInTheDocument()
  })
})
