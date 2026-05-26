import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn().mockResolvedValue(undefined) }),
}))

vi.mock('@/hooks/useGroups', () => ({
  useMyJoinRequests: () => ({ data: { requests: [] } }),
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

describe('OnboardingPage', () => {
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
})
