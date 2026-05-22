import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createElement } from 'react'
import { OnboardingGuard } from '@/router/guards/OnboardingGuard'

const mockUseUserGroups = vi.fn()

vi.mock('@/hooks/useGroups', () => ({
  useUserGroups: () => mockUseUserGroups(),
  groupKeys: { lists: () => ['groups', 'list'] },
}))

function makeWrapper(initialPath: string) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      MemoryRouter,
      { initialEntries: [initialPath] },
      createElement(
        Routes,
        null,
        createElement(Route, { path: '/onboarding', element: createElement('div', null, 'Onboarding') }),
        createElement(
          Route,
          { element: createElement(OnboardingGuard) },
          createElement(Route, { path: '/', element: children }),
          createElement(Route, { path: '/groups', element: createElement('div', null, 'Groups') }),
        ),
      ),
    )
}

describe('OnboardingGuard', () => {
  it('renders null while loading', () => {
    mockUseUserGroups.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(
      createElement('div', null, 'Home'),
      { wrapper: makeWrapper('/') },
    )
    expect(container.firstChild).toBeNull()
  })

  it('redirects to /onboarding when user has no groups', () => {
    mockUseUserGroups.mockReturnValue({ data: { groups: [] }, isLoading: false })
    render(createElement('div', null, 'Home'), { wrapper: makeWrapper('/') })
    expect(screen.getByText('Onboarding')).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('renders children when user has at least one group', () => {
    mockUseUserGroups.mockReturnValue({
      data: { groups: [{ id: '1', name: 'Grupo', emoji: null, coverUrl: null }] },
      isLoading: false,
    })
    render(createElement('div', null, 'Home'), { wrapper: makeWrapper('/') })
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Onboarding')).not.toBeInTheDocument()
  })
})
