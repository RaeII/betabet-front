import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createElement } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ReferralApplyHost } from '@/components/referral/ReferralApplyHost'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types/auth.types'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

const baseUser: User = {
  id: 'user-1',
  name: 'Usuário',
  email: 'user@example.com',
  avatarUrl: null,
  referralCode: 'OWN123',
  referredByCode: null,
  referralCount: 1,
  chartUnlocked: false,
  isAdmin: false,
  createdAt: '2026-05-19T00:00:00.000Z',
}

function renderHost(user: User, initialEntry = '/groups/group-1?ref=ABC123&tab=ranking') {
  vi.mocked(useAuth).mockReturnValue({
    user,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    setUser: vi.fn(),
  })

  render(
    createElement(
      MemoryRouter,
      { initialEntries: [initialEntry] },
      createElement(
        Routes,
        null,
        createElement(Route, { path: '/groups/:groupId', element: createElement(ReferralApplyHost) }),
      ),
    ),
  )
}

describe('ReferralApplyHost', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  it('tells referred users that they already have an indication', async () => {
    renderHost({ ...baseUser, referredByCode: 'REF999' })

    expect(await screen.findByRole('heading', { name: /indicação já registrada/i })).toBeInTheDocument()
    expect(screen.getByText(/seu usuário já possui uma indicação vinculada/i)).toBeInTheDocument()
  })

  it('tells existing users without indication that referrals are only for new accounts', async () => {
    renderHost(baseUser)

    expect(await screen.findByRole('heading', { name: /indicação apenas para novas contas/i })).toBeInTheDocument()
    expect(screen.getByText(/indicações são válidas apenas para novas contas/i)).toBeInTheDocument()
  })

  it('removes only the ref param when the notice closes', async () => {
    const user = userEvent.setup()
    renderHost(baseUser)

    await user.click(await screen.findByRole('button', { name: /entendi/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/groups/group-1?tab=ranking', {
      replace: true,
      state: null,
    })
  })
})
