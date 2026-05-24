import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/hooks/useActiveGroup', () => ({ useActiveGroup: vi.fn() }))
vi.mock('@/hooks/useGroups', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useGroups')>('@/hooks/useGroups')
  return { ...actual, useUserGroups: () => ({ data: { groups: [] } }) }
})
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u' } }) }))

import { GroupMobileNav } from '@/components/layout/GroupMobileNav'
import { useActiveGroup } from '@/hooks/useActiveGroup'

const mockedActive = useActiveGroup as ReturnType<typeof vi.fn>

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
  beforeEach(() => vi.clearAllMocks())

  it('renders mobile nav with 5 items for member', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    renderNav()
    expect(screen.getByLabelText(/Navegação do grupo \(mobile\)/i)).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Configurações')).not.toBeInTheDocument()
  })

  it('renders 6 items for admin', () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: true })
    renderNav()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('"Grupos" button opens the modal', async () => {
    mockedActive.mockReturnValue({ groupId: 'g1', isAdmin: false })
    renderNav()
    fireEvent.click(screen.getByRole('button', { name: /Grupos/i }))
    expect(await screen.findByText(/Seus grupos/i)).toBeInTheDocument()
  })
})
