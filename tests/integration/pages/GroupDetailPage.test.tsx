import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { GroupDetailPage } from '@/pages/groups/GroupDetailPage'
import { GroupsPage } from '@/pages/groups/GroupsPage'
import { AuthProvider } from '@/context/auth.context'
import { server } from '../../mocks/server'
import { groupsHandlers } from './groups.handlers'
import { matchesHandlers } from './matches.handlers'
import { authHandlers } from '../../mocks/handlers/auth.handlers'

function makeWrapper(initialEntry = '/groups/group-1') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        AuthProvider,
        null,
        createElement(
          MemoryRouter,
          { initialEntries: [initialEntry] },
          createElement(Routes, null,
            createElement(Route, { path: '/groups', element: createElement(GroupsPage) }),
            createElement(Route, { path: '/groups/:groupId', element: children }),
            createElement(Route, { path: '/groups/:groupId/matches/:matchId', element: createElement('div', null, 'Match detail') }),
          ),
        ),
      ),
    )
}

describe('GroupDetailPage', () => {
  beforeEach(() => server.use(...authHandlers, ...groupsHandlers, ...matchesHandlers))

  it('renders the group name', async () => {
    render(createElement(GroupDetailPage), { wrapper: makeWrapper() })

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Bolão dos Amigos' })).toBeInTheDocument(),
    )
  })

  it('shows a bounded desktop rail with the active group and switches groups', async () => {
    const user = userEvent.setup()
    render(createElement(GroupDetailPage), { wrapper: makeWrapper() })

    const rail = await screen.findByLabelText('Grupos do usuário')
    await waitFor(() =>
      expect(within(rail).getByRole('link', { current: 'page' })).toHaveTextContent('Bolão dos Amigos'),
    )
    expect(screen.getByRole('heading', { name: 'Bolão dos Amigos' })).toBeInTheDocument()

    await user.click(within(rail).getByRole('link', { name: /Liga da Firma/ }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Liga da Firma' })).toBeInTheDocument())
    expect(within(rail).getByRole('link', { current: 'page' })).toHaveTextContent('Liga da Firma')
  })

  it('shows a bounded group selector on the groups route', async () => {
    render(createElement(GroupDetailPage), { wrapper: makeWrapper('/groups') })

    expect(await screen.findByRole('heading', { name: 'Grupos' })).toBeInTheDocument()
    expect(screen.getByTestId('groups-page-shell')).toHaveClass('mx-auto', 'max-w-5xl')
    expect(await screen.findByRole('link', { name: /Bolão dos Amigos/ })).toHaveAttribute('href', '/groups/group-1')
  })

  it('shows mobile current group context and a return control', async () => {
    render(createElement(GroupDetailPage), { wrapper: makeWrapper() })

    const mobileHeader = await screen.findByTestId('group-mobile-header')
    expect(within(mobileHeader).getByText('Bolão dos Amigos')).toBeInTheDocument()
    expect(within(mobileHeader).getByRole('link', { name: /Ver grupos/ })).toHaveAttribute('href', '/groups')
  })

  it('keeps the group flow 320px-safe with no horizontal overflow wrapper', async () => {
    window.innerWidth = 320
    render(createElement(GroupDetailPage), { wrapper: makeWrapper() })

    expect(await screen.findByTestId('group-detail-shell')).toHaveClass('overflow-x-hidden')
    expect(screen.getByTestId('group-mobile-header')).toHaveClass('min-w-0')
  })

  it('renders the group home hero and preview sections with group-scoped links', async () => {
    render(createElement(GroupDetailPage), { wrapper: makeWrapper() })

    expect(await screen.findByTestId('group-home-hero')).toHaveTextContent('Bolão dos Amigos')
    expect(screen.getByRole('heading', { name: 'Próximas partidas' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Partidas passadas' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ranking' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Brasil contra Argentina/ })).toHaveAttribute(
      'href',
      '/groups/group-1/matches/match-1',
    )
    expect(screen.getByRole('link', { name: /França contra Seleção Internacional/ })).toHaveAttribute(
      'href',
      '/groups/group-1/matches/match-2',
    )
  })

  it('renders empty preview states without losing the active group context', async () => {
    server.use(
      http.get('/api/matches', () => HttpResponse.json({ groupStage: {}, knockout: {} })),
      http.get('/api/groups/:groupId/ranking', () =>
        HttpResponse.json({ ranking: [], updatedAt: new Date().toISOString() }),
      ),
    )
    render(createElement(GroupDetailPage), { wrapper: makeWrapper() })

    expect(await screen.findByTestId('group-home-hero')).toHaveTextContent('Bolão dos Amigos')
    expect(screen.getByText('Nenhuma próxima partida.')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma partida passada.')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma aposta no ranking ainda.')).toBeInTheDocument()
  })
})
