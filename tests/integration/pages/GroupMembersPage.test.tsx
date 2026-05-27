import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { createElement } from 'react'

vi.mock('@/hooks/useActiveGroup', () => ({ useActiveGroup: vi.fn() }))
vi.mock('@/hooks/useGroups', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useGroups')>('@/hooks/useGroups')
  return {
    ...actual,
    useJoinRequests: vi.fn(),
    useHandleJoinRequest: vi.fn(),
    useGroupMembers: vi.fn(),
    useRemoveMember: vi.fn(),
  }
})

import { useActiveGroup } from '@/hooks/useActiveGroup'
import {
  useGroupMembers,
  useHandleJoinRequest,
  useJoinRequests,
  useRemoveMember,
} from '@/hooks/useGroups'
import { GroupMembersPage } from '@/pages/groups/GroupMembersPage'

const mockedActive = useActiveGroup as ReturnType<typeof vi.fn>
const mockedJoinRequests = useJoinRequests as ReturnType<typeof vi.fn>
const mockedHandleJoinRequest = useHandleJoinRequest as ReturnType<typeof vi.fn>
const mockedGroupMembers = useGroupMembers as ReturnType<typeof vi.fn>
const mockedRemoveMember = useRemoveMember as ReturnType<typeof vi.fn>
const mutate = vi.fn()

const group = {
  id: 'g1',
  name: 'Bolão',
  emoji: null,
  coverUrl: null,
  adminId: 'u1',
  resultPoints: 1,
  exactScorePoints: 3,
  showBetsBeforeKickoff: true,
  joinMode: 'request' as const,
  memberCount: 1,
  inviteCode: 'ABC12345',
  createdAt: new Date().toISOString(),
}

function renderPage(path = '/groups/g1/membros') {
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      null,
      createElement(GroupMembersPage),
    ),
  )
}

describe('GroupMembersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutate.mockReset()
    mockedActive.mockReturnValue({ groupId: 'g1', group, role: 'admin', isAdmin: true })
    mockedGroupMembers.mockReturnValue({
      data: {
        members: [
          {
            groupId: 'g1',
            userId: 'u1',
            role: 'admin',
            joinedAt: new Date().toISOString(),
            user: { id: 'u1', name: 'Admin User', avatarUrl: null },
          },
        ],
      },
    })
    mockedJoinRequests.mockReturnValue({
      data: {
        requests: [
          {
            id: 'r1',
            groupId: 'g1',
            userId: 'u2',
            user: { id: 'u2', name: 'João Silva', avatarUrl: null },
            createdAt: '2026-05-26T12:30:00.000Z',
          },
        ],
      },
      isLoading: false,
      isError: false,
    })
    mockedHandleJoinRequest.mockReturnValue({ mutate, isPending: false })
    mockedRemoveMember.mockReturnValue({ mutate: vi.fn(), isPending: false })
  })

  it('shows members by default and lets admin open requests tab', () => {
    renderPage()

    expect(screen.getByText('Admin User')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: /Solicitações/i }))

    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Aprovar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Recusar/i })).toBeInTheDocument()
  })

  it('approves a pending request', () => {
    renderPage()

    fireEvent.click(screen.getByRole('tab', { name: /Solicitações/i }))
    fireEvent.click(screen.getByRole('button', { name: /Aprovar/i }))

    expect(mutate).toHaveBeenCalledWith({ requestId: 'r1', action: 'approve' })
  })

  it('opens requests tab from route query', () => {
    renderPage('/groups/g1/membros?tab=requests')

    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Solicitações/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('does not show requests tab for regular members', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', group, role: 'member', isAdmin: false })

    renderPage()

    expect(screen.queryByRole('tab', { name: /Solicitações/i })).not.toBeInTheDocument()
  })

  it('still renders members while role is not available yet', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', group, role: null, isAdmin: false })

    renderPage()

    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /Solicitações/i })).not.toBeInTheDocument()
  })

  it('shows loading state while group data is not available yet', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', group: null, role: null, isAdmin: false })

    renderPage()

    expect(screen.getByText(/Carregando membros/i)).toBeInTheDocument()
  })
})
