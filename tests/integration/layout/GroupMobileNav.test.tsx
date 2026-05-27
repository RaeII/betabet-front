import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/hooks/useActiveGroup', () => ({ useActiveGroup: vi.fn() }))
vi.mock('@/hooks/useGroups', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useGroups')>('@/hooks/useGroups')
  return {
    ...actual,
    useUserGroups: () => ({ data: { groups: [] } }),
    useJoinRequests: vi.fn(),
  }
})
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u' } }) }))

import { GroupMobileNav } from '@/components/layout/GroupMobileNav'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useJoinRequests } from '@/hooks/useGroups'

const mockedActive = useActiveGroup as ReturnType<typeof vi.fn>
const mockedRequests = useJoinRequests as ReturnType<typeof vi.fn>

function renderNav() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        MemoryRouter,
        { initialEntries: ['/groups/g1'] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/groups/:groupId', element: createElement(GroupMobileNav) }),
        ),
      ),
    ),
  )
}

describe('GroupMobileNav', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedRequests.mockReturnValue({ data: { requests: [] } })
  })

  it('renders mobile nav without Palpites or Configurações', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    renderNav()
    expect(screen.getByLabelText(/Navegação do grupo \(mobile\)/i)).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Palpites')).not.toBeInTheDocument()
    expect(screen.queryByText('Configurações')).not.toBeInTheDocument()
  })

  it('centers Home between all mobile menu icons', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    renderNav()

    const nav = screen.getByLabelText(/Navegação do grupo \(mobile\)/i)
    const list = nav.querySelector('ul')
    const homeLink = screen.getByRole('link', { name: 'Home' })
    const labels = Array.from(nav.querySelectorAll('a, button')).map(item => item.textContent)

    expect(list).toHaveClass('grid', 'items-center')
    expect(list).toHaveStyle({ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' })
    expect(homeLink).toHaveClass('items-center', 'justify-center', 'text-center')
    expect(labels).toEqual(['Jogos', 'Ranking', 'Home', 'Membros', 'Grupos'])
  })

  it('does not render Configurações for admin in the mobile menu', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: true })
    renderNav()
    expect(screen.queryByText('Configurações')).not.toBeInTheDocument()
    expect(screen.queryByText('Palpites')).not.toBeInTheDocument()
  })

  it('shows pending request notification on Membros for admin', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: true })
    mockedRequests.mockReturnValue({ data: { requests: [{ id: 'r1' }] } })
    renderNav()
    expect(screen.getByLabelText('1 solicitações pendentes')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Membros/i })).toHaveAttribute(
      'href',
      '/groups/g1/membros?tab=requests',
    )
  })

  it('"Grupos" button opens the modal', async () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    renderNav()
    fireEvent.click(screen.getByRole('button', { name: /Grupos/i }))
    expect(await screen.findByText(/Seus grupos/i)).toBeInTheDocument()
  })
})
