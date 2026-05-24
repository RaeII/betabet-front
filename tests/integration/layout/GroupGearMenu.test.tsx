import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/hooks/useActiveGroup', () => ({ useActiveGroup: vi.fn() }))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'me' } }) }))
vi.mock('@/hooks/useLeaveGroup', () => ({
  useLeaveGroup: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
}))
vi.mock('@/hooks/useGroups', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useGroups')>('@/hooks/useGroups')
  return { ...actual, useGroupMembers: vi.fn() }
})

import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useGroupMembers } from '@/hooks/useGroups'
import { GroupGearMenu } from '@/components/layout/GroupGearMenu'

const mockedActive = useActiveGroup as ReturnType<typeof vi.fn>
const mockedMembers = useGroupMembers as ReturnType<typeof vi.fn>

const baseGroup = {
  id: 'g1',
  name: 'Bolão',
  emoji: null,
  coverUrl: null,
  adminId: 'user-1',
  resultPoints: 1,
  exactScorePoints: 3,
  showBetsBeforeKickoff: false,
  joinMode: 'request' as const,
  memberCount: 1,
  inviteCode: 'X',
  createdAt: new Date().toISOString(),
}

function renderMenu() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(MemoryRouter, null, createElement(GroupGearMenu)),
    ),
  )
}

describe('GroupGearMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedMembers.mockReturnValue({ data: { members: [] } })
  })

  async function openMenu() {
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: /Ações do grupo/i })
    trigger.focus()
    await user.keyboard('{Enter}')
  }

  it('navigates to detalhes when "Detalhes" is selected', async () => {
    mockedActive.mockReturnValue({
      groupId: 'g1',
      group: baseGroup,
      role: 'member',
      isAdmin: false,
    })
    renderMenu()
    await openMenu()
    const detalhes = await screen.findByText('Detalhes')
    fireEvent.click(detalhes)
    expect(mockNavigate).toHaveBeenCalledWith('/groups/g1/detalhes')
  })

  it('opens leave confirm when "Sair" is selected for a non-last-admin', async () => {
    mockedActive.mockReturnValue({
      groupId: 'g1',
      group: baseGroup,
      role: 'member',
      isAdmin: false,
    })
    renderMenu()
    await openMenu()
    const sair = await screen.findByText('Sair')
    fireEvent.click(sair)
    expect(await screen.findByText(/Sair de Bolão\?/i)).toBeInTheDocument()
  })

  it('disables "Sair" when caller is last admin with other members', async () => {
    mockedActive.mockReturnValue({
      groupId: 'g1',
      group: { ...baseGroup, memberCount: 5 },
      role: 'admin',
      isAdmin: true,
    })
    mockedMembers.mockReturnValue({
      data: {
        members: [
          { userId: 'me', role: 'admin', groupId: 'g1', joinedAt: '', user: { id: 'me', name: 'Me', avatarUrl: null } },
          { userId: 'u2', role: 'member', groupId: 'g1', joinedAt: '', user: { id: 'u2', name: 'Other', avatarUrl: null } },
        ],
      },
    })
    renderMenu()
    await openMenu()
    const sair = await screen.findByText('Sair')
    expect(sair.closest('[role="menuitem"]')).toHaveAttribute('data-disabled')
  })
})
