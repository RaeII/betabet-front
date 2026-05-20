import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { AuthProvider } from '@/context/auth.context'
import { server } from '../../mocks/server'
import { referralHandlers } from './referral.handlers'
import { authHandlers } from '../../mocks/handlers/auth.handlers'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        AuthProvider,
        null,
        createElement(MemoryRouter, null, children),
      ),
    )
}

describe('ProfilePage', () => {
  beforeEach(() => server.use(...authHandlers, ...referralHandlers))

  it('renders referral section', async () => {
    render(createElement(ProfilePage), { wrapper: makeWrapper() })

    await waitFor(() => expect(screen.getByRole('heading', { name: /indicações/i })).toBeInTheDocument())
  })

  it('shows referral count', async () => {
    render(createElement(ProfilePage), { wrapper: makeWrapper() })

    await waitFor(() => expect(screen.getByText(/2/)).toBeInTheDocument())
  })
})
