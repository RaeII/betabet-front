import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { CreateGroupPage } from '@/pages/groups/CreateGroupPage'
import { server } from '../../mocks/server'

const mockGroup = {
  id: 'new-group-1',
  name: 'Meu Bolão',
  emoji: '🏆',
  coverUrl: null,
  adminId: 'user-1',
  resultPoints: 1,
  exactScorePoints: 3,
  showBetsBeforeKickoff: false,
  joinMode: 'request',
  memberCount: 1,
  inviteCode: 'XYZ',
  createdAt: new Date().toISOString(),
}

const createGroupHandlers = [
  http.post('/api/groups', async ({ request }) => {
    const body = await request.json() as { name: string }
    return HttpResponse.json({ group: { ...mockGroup, name: body.name } }, { status: 201 })
  }),
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

describe('CreateGroupPage', () => {
  beforeEach(() => {
    server.use(...createGroupHandlers)
    mockNavigate.mockReset()
  })

  it('shows step 1 with name input and emoji grid', () => {
    render(createElement(CreateGroupPage), { wrapper: makeWrapper() })
    expect(screen.getByPlaceholderText(/nome do grupo/i)).toBeInTheDocument()
    expect(screen.getByText(/passo 1/i)).toBeInTheDocument()
  })

  it('shows live preview when name is typed', async () => {
    const user = userEvent.setup()
    render(createElement(CreateGroupPage), { wrapper: makeWrapper() })

    await user.type(screen.getByPlaceholderText(/nome do grupo/i), 'Bolão do RJ')
    expect(screen.getByText('Bolão do RJ')).toBeInTheDocument()
  })

  it('advances to step 2 when next button is clicked with valid name', async () => {
    const user = userEvent.setup()
    render(createElement(CreateGroupPage), { wrapper: makeWrapper() })

    await user.type(screen.getByPlaceholderText(/nome do grupo/i), 'Bolão Legal')
    await user.click(screen.getByRole('button', { name: /próximo/i }))

    expect(screen.getByText(/passo 2/i)).toBeInTheDocument()
    expect(screen.getAllByText(/brasil/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/frança/i).length).toBeGreaterThan(0)
  })

  it('returns to step 1 when back button is clicked in step 2', async () => {
    const user = userEvent.setup()
    render(createElement(CreateGroupPage), { wrapper: makeWrapper() })

    await user.type(screen.getByPlaceholderText(/nome do grupo/i), 'Bolão Legal')
    await user.click(screen.getByRole('button', { name: /próximo/i }))
    await user.click(screen.getByRole('button', { name: /voltar/i }))

    expect(screen.getByText(/passo 1/i)).toBeInTheDocument()
  })

  it('creates group and navigates on final submit', async () => {
    const user = userEvent.setup()
    render(createElement(CreateGroupPage), { wrapper: makeWrapper() })

    await user.type(screen.getByPlaceholderText(/nome do grupo/i), 'Meu Bolão')
    await user.click(screen.getByRole('button', { name: /próximo/i }))
    await user.click(screen.getByRole('button', { name: /criar grupo/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/groups/new-group-1'),
    )
  })
})
