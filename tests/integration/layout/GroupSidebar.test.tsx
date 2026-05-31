import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/hooks/useActiveGroup', () => ({ useActiveGroup: vi.fn() }))
vi.mock('@/hooks/useGroupLiveMatch', () => ({ useGroupHasLiveMatch: vi.fn() }))
vi.mock('@/hooks/useGroups', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useGroups')>('@/hooks/useGroups')
  return {
    ...actual,
    useUserGroups: () => ({ data: { groups: [] } }),
    useJoinRequests: vi.fn(),
    useMyJoinRequests: () => ({ data: { requests: [] }, isLoading: false }),
  }
})
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u' } }) }))
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

import { GroupSidebar } from '@/components/layout/GroupSidebar'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useGroupHasLiveMatch } from '@/hooks/useGroupLiveMatch'
import { useJoinRequests } from '@/hooks/useGroups'

const mockedActive = useActiveGroup as ReturnType<typeof vi.fn>
const mockedHasLiveMatch = useGroupHasLiveMatch as ReturnType<typeof vi.fn>
const mockedRequests = useJoinRequests as ReturnType<typeof vi.fn>

function renderSidebar(path = '/groups/g1') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/groups/:groupId', element: createElement(GroupSidebar) }),
        ),
      ),
    ),
  )
}

describe('GroupSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedHasLiveMatch.mockReturnValue(false)
    mockedRequests.mockReturnValue({ data: { requests: [] } })
  })

  it('member sees the regular sidebar items without Palpites or Configurações', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    renderSidebar()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Jogos')).toBeInTheDocument()
    expect(screen.getByText('Ranking')).toBeInTheDocument()
    expect(screen.getByText('Membros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bolões/i })).toBeInTheDocument()
    expect(screen.queryByText('Palpites')).not.toBeInTheDocument()
    expect(screen.queryByText('Configurações')).not.toBeInTheDocument()
  })

  it('admin does not see Configurações in the sidebar', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: true })
    renderSidebar()
    expect(screen.queryByText('Configurações')).not.toBeInTheDocument()
    expect(screen.queryByText('Palpites')).not.toBeInTheDocument()
  })

  it('shows pending request notification on Membros for admin', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: true })
    mockedRequests.mockReturnValue({
      data: { requests: [{ id: 'r1' }, { id: 'r2' }] },
    })
    renderSidebar()
    expect(screen.getByLabelText('2 solicitações pendentes')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Membros/i })).toHaveAttribute(
      'href',
      '/groups/g1/membros?tab=requests',
    )
  })

  it('shows the live notification only when a match is actually live', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    mockedHasLiveMatch.mockReturnValue(true)

    renderSidebar()

    expect(screen.getByLabelText('Partida ao vivo')).toBeInTheDocument()
  })

  it('does not show the live notification without an actual live match', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    mockedHasLiveMatch.mockReturnValue(false)

    renderSidebar()

    expect(screen.queryByLabelText('Partida ao vivo')).not.toBeInTheDocument()
  })

  it('renders aria-current on the active destination', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    renderSidebar('/groups/g1')
    const active = screen.getByRole('link', { name: 'Home' })
    expect(active.getAttribute('aria-current')).toBe('page')
  })

  it('opens the groups modal from the regular menu item', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    renderSidebar()

    fireEvent.click(screen.getByRole('button', { name: /Bolões/i }))

    expect(screen.getByRole('dialog', { name: /Seus grupos/i })).toBeInTheDocument()
  })
})
