import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('@/hooks/useGroups', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useGroups')>('@/hooks/useGroups')
  return { ...actual, useUserGroups: vi.fn(), useMyJoinRequests: vi.fn() }
})

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

import { useAuth } from '@/hooks/useAuth'
import { useMyJoinRequests, useUserGroups } from '@/hooks/useGroups'
import { GroupsModal } from '@/pages/groups/components/GroupsModal'

const mockedAuth = useAuth as ReturnType<typeof vi.fn>
const mockedGroups = useUserGroups as ReturnType<typeof vi.fn>
const mockedMyRequests = useMyJoinRequests as ReturnType<typeof vi.fn>

const makeGroup = (id: string, name: string) => ({
  id,
  name,
  emoji: null,
  coverUrl: null,
  adminId: 'user-1',
  resultPoints: 1,
  exactScorePoints: 3,
  showBetsBeforeKickoff: false,
  joinMode: 'request' as const,
  memberCount: 3,
  inviteCode: 'X',
  createdAt: new Date().toISOString(),
})

function renderModal(props: { open?: boolean; activeGroupId?: string | null } = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const onOpenChange = vi.fn()
  const result = render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        MemoryRouter,
        null,
        createElement(GroupsModal, {
          open: props.open ?? true,
          onOpenChange,
          activeGroupId: props.activeGroupId ?? 'group-1',
        }),
      ),
    ),
  )
  return { ...result, onOpenChange }
}

describe('GroupsModal (list mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockReturnValue({ user: { id: 'user-1' } })
    mockedGroups.mockReturnValue({
      data: {
        groups: [
          makeGroup('group-1', 'Bolão A'),
          makeGroup('group-2', 'Bolão B'),
        ],
      },
    })
    mockedMyRequests.mockReturnValue({ data: { requests: [] }, isLoading: false })
  })

  it('lists groups and marks the active one', () => {
    renderModal({ activeGroupId: 'group-1' })
    expect(screen.getByText('Bolão A')).toBeInTheDocument()
    expect(screen.getByText('Bolão B')).toBeInTheDocument()
    const active = screen.getByRole('button', { name: /Bolão A/ })
    expect(active.getAttribute('aria-current')).toBe('true')
  })

  it('navigates and closes when selecting another group', () => {
    renderModal({ activeGroupId: 'group-1' })
    const targetBtn = screen.getByRole('button', { name: /Bolão B/ })
    fireEvent.click(targetBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/groups/group-2')
  })

  it('switches to create mode when clicking "Criar novo grupo"', () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /Criar novo grupo/i }))
    expect(screen.getByText(/Passo 1 de 2/i)).toBeInTheDocument()
  })

  it('navigates to join group flow when clicking "Entrar em um grupo"', () => {
    const { onOpenChange } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: /Entrar em um grupo/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding/join')
  })

  it('lists groups with pending approval requests', () => {
    mockedMyRequests.mockReturnValue({
      data: {
        requests: [
          {
            id: 'request-1',
            groupId: 'group-3',
            groupName: 'Bolão Pendente',
            groupEmoji: null,
            groupCoverUrl: null,
            createdAt: new Date().toISOString(),
          },
        ],
      },
      isLoading: false,
    })

    renderModal()

    expect(screen.getByText('Aguardando aprovação')).toBeInTheDocument()
    expect(screen.getByText('Bolão Pendente')).toBeInTheDocument()
    expect(screen.getByText('Solicitação enviada')).toBeInTheDocument()
  })
})
