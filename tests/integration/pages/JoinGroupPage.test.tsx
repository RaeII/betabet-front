import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { JoinGroupPage } from '@/pages/onboarding/JoinGroupPage'
import { server } from '../../mocks/server'

const mockGroup = {
  id: 'group-99',
  name: 'Bolão dos Campeões',
  emoji: '🏆',
  coverUrl: null,
  memberCount: 7,
}

const joinHandlers = [
  http.get('/api/groups/invite/:code', ({ params }) => {
    if (params.code === 'BADCODE') {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json({ group: mockGroup })
  }),
  http.post('/api/groups/:groupId/join', () =>
    HttpResponse.json({ joined: true, pending: false }),
  ),
]

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn().mockResolvedValue(undefined) }),
}))

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(MemoryRouter, null, children),
    )
}

describe('JoinGroupPage', () => {
  beforeEach(() => {
    server.use(...joinHandlers)
    mockNavigate.mockReset()
  })

  it('renders input and confirm button', () => {
    render(createElement(JoinGroupPage), { wrapper: makeWrapper() })
    expect(screen.getByPlaceholderText(/código ou link/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument()
  })

  it('extracts code from full URL', async () => {
    const user = userEvent.setup()
    render(createElement(JoinGroupPage), { wrapper: makeWrapper() })

    await user.type(
      screen.getByPlaceholderText(/código ou link/i),
      'http://localhost:5173/invite/ABC123',
    )
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    await waitFor(() =>
      expect(screen.getByText('Bolão dos Campeões')).toBeInTheDocument(),
    )
  })

  it('resolves bare code and shows group preview', async () => {
    const user = userEvent.setup()
    render(createElement(JoinGroupPage), { wrapper: makeWrapper() })

    await user.type(screen.getByPlaceholderText(/código ou link/i), 'ABC123')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    await waitFor(() =>
      expect(screen.getByText('Bolão dos Campeões')).toBeInTheDocument(),
    )
    expect(screen.getByText(/7 membros/i)).toBeInTheDocument()
  })

  it('joins group and navigates on confirm', async () => {
    const user = userEvent.setup()
    render(createElement(JoinGroupPage), { wrapper: makeWrapper() })

    await user.type(screen.getByPlaceholderText(/código ou link/i), 'ABC123')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    await waitFor(() => screen.getByText('Bolão dos Campeões'))
    await user.click(screen.getByRole('button', { name: /entrar no grupo/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/groups/group-99'),
    )
  })

  it('shows error for invalid code', async () => {
    const user = userEvent.setup()
    render(createElement(JoinGroupPage), { wrapper: makeWrapper() })

    await user.type(screen.getByPlaceholderText(/código ou link/i), 'BADCODE')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    await waitFor(() =>
      expect(screen.getByText(/inválido|expirado/i)).toBeInTheDocument(),
    )
  })
})
