import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, useState } from 'react'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import type { BettingGroup, MyJoinRequest } from '@/types/group.types'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn().mockResolvedValue(undefined) }),
}))

const mockRefetchUserGroups = vi.fn()
let currentRequests: MyJoinRequest[] = []
let currentGroups: Partial<BettingGroup>[] = []
let refreshRoutes: (() => void) | null = null

vi.mock('@/hooks/useGroups', () => ({
  useMyJoinRequests: () => ({ data: { requests: currentRequests } }),
  useUserGroups: () => ({
    data: { groups: currentGroups },
    refetch: mockRefetchUserGroups,
  }),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return createElement(
    QueryClientProvider,
    { client: qc },
    createElement(MemoryRouter, null, children),
  )
}

function TestRoutes() {
  const [, setRenderCount] = useState(0)
  refreshRoutes = () => setRenderCount(count => count + 1)

  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/groups/:groupId" element={<div data-testid="group-page">Group page</div>} />
    </Routes>
  )
}

function renderWithRoutes() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/onboarding']}>
        <TestRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    currentRequests = []
    currentGroups = []
    refreshRoutes = null
    mockRefetchUserGroups.mockClear()
  })

  it('renders app description and welcome headline', () => {
    render(createElement(OnboardingPage), { wrapper })
    expect(screen.getByText(/betabet/i)).toBeInTheDocument()
  })

  it('renders "Entrar em um grupo" card linking to /onboarding/join', () => {
    render(createElement(OnboardingPage), { wrapper })
    const link = screen.getByRole('link', { name: /entrar em um grupo/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/onboarding/join')
  })

  it('renders "Criar um grupo" card linking to /groups/new', () => {
    render(createElement(OnboardingPage), { wrapper })
    const link = screen.getByRole('link', { name: /criar um grupo/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/groups/new')
  })

  it('does not render bottom nav or header', () => {
    render(createElement(OnboardingPage), { wrapper })
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('redirects to the requested group when a pending request is approved', async () => {
    currentRequests = [
      {
        id: 'request-1',
        groupId: 'group-approved',
        groupName: 'Bolão aprovado',
        groupEmoji: '🏆',
        groupCoverUrl: null,
        createdAt: '2026-05-26T12:00:00.000Z',
      },
    ]
    renderWithRoutes()

    currentRequests = []
    currentGroups = [{ id: 'group-approved', name: 'Bolão aprovado' }]
    act(() => {
      refreshRoutes?.()
    })

    await waitFor(() => expect(screen.getByTestId('group-page')).toBeInTheDocument())
    expect(mockRefetchUserGroups).toHaveBeenCalled()
  })
})
