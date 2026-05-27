import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/hooks/useActiveGroup', () => ({
  useActiveGroup: vi.fn(() => ({
    groupId: 'g1',
    group: {
      id: 'g1',
      name: 'Bolão',
      emoji: null,
      coverUrl: null,
      adminId: 'u',
      resultPoints: 1,
      exactScorePoints: 3,
      showBetsBeforeKickoff: true,
      joinMode: 'request',
      memberCount: 1,
      inviteCode: 'X',
      createdAt: new Date().toISOString(),
    },
    role: 'member',
    isAdmin: false,
  })),
}))
vi.mock('@/hooks/useGroups', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useGroups')>('@/hooks/useGroups')
  return {
    ...actual,
    useGroupMembers: () => ({ data: { members: [] } }),
    useUserGroups: () => ({ data: { groups: [] } }),
  }
})
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u', name: 'Usuário' } }) }))
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

import { GroupShell } from '@/components/layout/GroupShell'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'

function StubProfilePage() {
  return <div data-testid="profile-stub">Profile</div>
}

function render_(path: string, element: React.ReactNode) {
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
          createElement(Route, { path, element }),
        ),
      ),
    ),
  )
}

function renderProfileShell() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        MemoryRouter,
        { initialEntries: ['/profile'] },
        createElement(
          Routes,
          null,
          createElement(
            Route,
            { path: '/profile', element: createElement(GroupShell) },
            createElement(Route, { index: true, element: createElement(StubProfilePage) }),
          ),
        ),
      ),
    ),
  )
}

describe('GroupShell layout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders shell with header on /groups/:groupId', () => {
    render_('/groups/g1', createElement(GroupShell))
    expect(screen.getByTestId('group-shell')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ações do grupo/i })).toBeInTheDocument()
  })

  it('does NOT render the group shell on /onboarding', () => {
    render_('/onboarding', createElement(OnboardingPage))
    expect(screen.queryByTestId('group-shell')).not.toBeInTheDocument()
  })

  it('renders the group shell on /profile', () => {
    renderProfileShell()
    expect(screen.getByTestId('group-shell')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegação do grupo' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /Navegação do grupo \(mobile\)/i })).toBeInTheDocument()
    expect(screen.getByTestId('profile-stub')).toBeInTheDocument()
  })
})
