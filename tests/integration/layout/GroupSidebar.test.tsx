import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/hooks/useActiveGroup', () => ({ useActiveGroup: vi.fn() }))
vi.mock('@/hooks/useGroups', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useGroups')>('@/hooks/useGroups')
  return { ...actual, useUserGroups: () => ({ data: { groups: [] } }) }
})
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u' } }) }))
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

import { GroupSidebar } from '@/components/layout/GroupSidebar'
import { useActiveGroup } from '@/hooks/useActiveGroup'

const mockedActive = useActiveGroup as ReturnType<typeof vi.fn>

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
  beforeEach(() => vi.clearAllMocks())

  it('member sees 5 items (no Configurações)', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    renderSidebar()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Jogos')).toBeInTheDocument()
    expect(screen.getByText('Palpites')).toBeInTheDocument()
    expect(screen.getByText('Ranking')).toBeInTheDocument()
    expect(screen.getByText('Membros')).toBeInTheDocument()
    expect(screen.queryByText('Configurações')).not.toBeInTheDocument()
  })

  it('admin sees 6 items including Configurações', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: true })
    renderSidebar()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('renders aria-current on the active destination', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    renderSidebar('/groups/g1')
    const active = screen.getByRole('link', { name: 'Home' })
    expect(active.getAttribute('aria-current')).toBe('page')
  })
})
