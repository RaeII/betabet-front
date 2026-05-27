import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { InvitePage } from '@/pages/invite/InvitePage'
import { server } from '../../mocks/server'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false }),
}))

const mockGroup = {
  id: 'group-99',
  name: 'Bolão dos Campeões',
  emoji: null,
  coverUrl: null,
  memberCount: 7,
  joinMode: 'request',
}

let joinRequests = 0

const inviteHandlers = [
  http.get('/api/groups', () => {
    return HttpResponse.json({
      groups: [{ id: 'group-1', name: 'Meu grupo' }],
    })
  }),
  http.get('/api/groups/invite/:code', () => {
    return HttpResponse.json({ group: mockGroup })
  }),
  http.post('/api/groups/:groupId/join', () => {
    joinRequests += 1
    return HttpResponse.json({ joined: false, pending: true })
  }),
]

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        MemoryRouter,
        { initialEntries: ['/invite/ABC123'] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/invite/:code', element: createElement(InvitePage) }),
        ),
      ),
    ),
  )
}

describe('InvitePage', () => {
  beforeEach(() => {
    joinRequests = 0
    mockNavigate.mockReset()
    server.use(...inviteHandlers)
  })

  it('shows the invite preview without sending the join request automatically', async () => {
    renderPage()

    await waitFor(() => expect(screen.getByText('Bolão dos Campeões')).toBeInTheDocument())

    expect(screen.getByRole('button', { name: /solicitar entrada/i })).toBeInTheDocument()
    expect(joinRequests).toBe(0)
  })

  it('sends the join request only after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('Bolão dos Campeões')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /solicitar entrada/i }))

    await waitFor(() => expect(joinRequests).toBe(1))
    expect(mockNavigate).toHaveBeenCalledWith(
      '/groups/group-1',
      expect.objectContaining({
        replace: true,
        state: { pendingJoin: { groupName: 'Bolão dos Campeões', groupEmoji: null } },
      }),
    )
  })
})
