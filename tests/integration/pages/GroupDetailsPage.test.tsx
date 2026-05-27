import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createElement } from 'react'
import { GroupDetailsPage } from '@/pages/groups/GroupDetailsPage'

vi.mock('@/hooks/useActiveGroup', () => ({ useActiveGroup: vi.fn() }))
vi.mock('@/hooks/useGroups', () => ({ useGroupMembers: vi.fn(), useUpdateGroup: vi.fn() }))
vi.mock('@/pages/groups/components/LeaveGroupConfirm', () => ({ LeaveGroupConfirm: () => null }))

import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useGroupMembers, useUpdateGroup } from '@/hooks/useGroups'

const mockedActive = useActiveGroup as ReturnType<typeof vi.fn>
const mockedGroupMembers = useGroupMembers as ReturnType<typeof vi.fn>
const mockedUpdateGroup = useUpdateGroup as ReturnType<typeof vi.fn>

const baseGroup = {
  id: 'g1',
  name: 'Bolão',
  emoji: null,
  coverUrl: null,
  adminId: 'user-1',
  resultPoints: 1,
  exactScorePoints: 3,
  showBetsBeforeKickoff: true,
  joinMode: 'request' as const,
  memberCount: 3,
  inviteCode: 'ABC12345',
  createdAt: new Date().toISOString(),
}

describe('GroupDetailsPage', () => {
  const mutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUpdateGroup.mockReturnValue({
      mutate,
      isPending: false,
      isError: false,
      isSuccess: false,
    })
    mockedGroupMembers.mockReturnValue({ data: { members: [] } })
  })

  it('renders editable group settings for admins', () => {
    mockedActive.mockReturnValue({
      groupId: 'g1',
      group: baseGroup,
      role: 'admin',
      isAdmin: true,
    })

    render(createElement(GroupDetailsPage))

    expect(screen.getByRole('heading', { name: 'Configurações do Bolão' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome do grupo')).toHaveValue('Bolão')
    expect(screen.getByLabelText('Entrada no bolão')).toHaveDisplayValue('Grupo fechado, solicitação para entrar')
    expect(screen.queryByLabelText('Mostrar apostas antes da partida começar')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Nome do grupo'), { target: { value: 'Novo Bolão' } })
    fireEvent.change(screen.getByLabelText('Pontos por resultado'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar configurações' }))

    expect(mutate).toHaveBeenCalledWith({
      name: 'Novo Bolão',
      resultPoints: 2,
      exactScorePoints: 3,
      joinMode: 'request',
    })
  })

  it('keeps read-only scoring details for regular members', () => {
    mockedActive.mockReturnValue({
      groupId: 'g1',
      group: baseGroup,
      role: 'member',
      isAdmin: false,
    })

    render(createElement(GroupDetailsPage))

    expect(screen.queryByRole('heading', { name: 'Configurações do Bolão' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pontuação' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Salvar configurações' })).not.toBeInTheDocument()
  })
})
