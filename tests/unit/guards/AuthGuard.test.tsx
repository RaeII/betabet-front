import { render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthGuard } from '@/router/guards/AuthGuard'

const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/pages/auth/LoginPage', () => ({
  LoginPage: () => 'Login home',
}))

vi.mock('@/components/group/PendingJoinHost', () => ({
  PendingJoinHost: () => null,
}))

vi.mock('@/components/group/JoinRequestStatusHost', () => ({
  JoinRequestStatusHost: () => null,
}))

vi.mock('@/components/referral/ReferralApplyHost', () => ({
  ReferralApplyHost: () => null,
}))

function LocationProbe() {
  const location = useLocation()
  return createElement('span', { 'data-testid': 'location' }, `${location.pathname}${location.search}`)
}

function renderGuard(initialPath: string) {
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [initialPath] },
      createElement(LocationProbe),
      createElement(
        Routes,
        null,
        createElement(
          Route,
          { path: '/', element: createElement(AuthGuard) },
          createElement(Route, {
            index: true,
            element: createElement('div', { 'data-testid': 'protected-root' }, 'Protected root'),
          }),
          createElement(Route, {
            path: 'groups/:groupId',
            element: createElement('div', { 'data-testid': 'protected-group' }, 'Protected group'),
          }),
        ),
      ),
    ),
  )
}

describe('AuthGuard', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false })
  })

  it('renders the public entry page at / when the user is logged out', () => {
    renderGuard('/?ref=ABC123')

    expect(screen.getByText('Login home')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/?ref=ABC123')
    expect(screen.queryByTestId('protected-root')).not.toBeInTheDocument()
  })

  it('redirects logged-out users from protected paths to / preserving search params', async () => {
    renderGuard('/groups/group-1?invite=ABC123&ref=REF123')

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/?invite=ABC123&ref=REF123')
    })
    expect(screen.getByText('Login home')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-group')).not.toBeInTheDocument()
  })

  it('renders protected root content when the user is authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })

    renderGuard('/')

    expect(screen.getByTestId('protected-root')).toBeInTheDocument()
    expect(screen.queryByText('Login home')).not.toBeInTheDocument()
  })
})
