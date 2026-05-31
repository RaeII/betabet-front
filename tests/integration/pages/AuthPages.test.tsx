import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import { http, HttpResponse } from 'msw'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AuthProvider } from '@/context/auth.context'
import { AdminAuthProvider } from '@/context/admin.context'
import { server } from '../../mocks/server'
import type { User } from '@/types/auth.types'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
  referralCode: 'TEST1234',
  referredByCode: null,
  referralCount: 1,
  chartUnlocked: false,
  isAdmin: false,
  createdAt: '2026-05-19T00:00:00.000Z',
}

function authCodeChallenge(
  challengeId: string,
  debugCode = '123456',
  resendDelayMs = 30_000,
) {
  return {
    challengeId,
    expiresAt: new Date(Date.now() + 4 * 60_000).toISOString(),
    resendAvailableAt: new Date(Date.now() + resendDelayMs).toISOString(),
    debugCode,
  }
}

function renderUserAuthPage(page: ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        AuthProvider,
        null,
        createElement(MemoryRouter, null, page),
      ),
    ),
  )
}

function renderAdminPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        AdminAuthProvider,
        null,
        createElement(MemoryRouter, null, createElement(AdminLoginPage)),
      ),
    ),
  )
}

describe('Auth pages', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    server.use(
      http.get('/api/auth/me', () => HttpResponse.json({ message: 'Sem sessão' }, { status: 401 })),
      http.post('/api/auth/login/request-code', () =>
        HttpResponse.json(
          authCodeChallenge('11111111-1111-4111-8111-111111111111'),
          { status: 202 },
        ),
      ),
      http.post('/api/auth/login/verify-code', () => HttpResponse.json({ user: mockUser })),
      http.post('/api/auth/register/request-code', () =>
        HttpResponse.json(
          authCodeChallenge('22222222-2222-4222-8222-222222222222'),
          { status: 202 },
        ),
      ),
      http.post('/api/auth/register/verify-code', () => HttpResponse.json({ user: mockUser }, { status: 201 })),
      http.post('/api/admin/auth/login', () => HttpResponse.json({ admin: { id: '1', name: 'Admin', email: 'admin@test.com', createdAt: '2026-05-19T00:00:00.000Z' } })),
      http.get('/api/admin/stats', () => HttpResponse.json({ totalUsers: 1, totalGroups: 0, totalBets: 0 })),
    )
  })

  it('login de usuário usa código de e-mail sem campo de senha', async () => {
    const user = userEvent.setup()
    renderUserAuthPage(createElement(LoginPage))

    expect(screen.queryByLabelText(/senha/i)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /enviar código/i }))

    const codeDigits = await screen.findAllByLabelText(/código dígito/i)
    expect(codeDigits).toHaveLength(6)

    await user.type(codeDigits[0], '12')
    expect(codeDigits[0]).toHaveValue('1')
    expect(codeDigits[1]).toHaveValue('2')
    expect(codeDigits[2]).toHaveFocus()

    await user.click(codeDigits[0])
    fireEvent.paste(codeDigits[0], {
      clipboardData: { getData: () => '123456' },
    })
    expect(codeDigits.map(input => (input as HTMLInputElement).value).join('')).toBe('123456')

    await user.click(screen.getByRole('button', { name: /validar código/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'))
  })

  it('login exibe expiração e permite reenviar código quando liberado', async () => {
    let requestCount = 0
    server.use(
      http.post('/api/auth/login/request-code', () => {
        requestCount += 1
        return HttpResponse.json(
          authCodeChallenge(
            requestCount === 1
              ? '11111111-1111-4111-8111-111111111111'
              : '33333333-3333-4333-8333-333333333333',
            requestCount === 1 ? '123456' : '654321',
            -1_000,
          ),
          { status: 202 },
        )
      }),
    )

    const user = userEvent.setup()
    renderUserAuthPage(createElement(LoginPage))

    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /enviar código/i }))

    expect(await screen.findByText(/código expira em/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reenviar código/i }))

    await waitFor(() => expect(requestCount).toBe(2))
    expect(await screen.findByText(/código de teste: 654321/i)).toBeInTheDocument()
  })

  it('login ignora envio duplicado enquanto a solicitação está pendente', async () => {
    let requestCount = 0
    let releaseRequest: (() => void) | undefined
    server.use(
      http.post('/api/auth/login/request-code', async () => {
        requestCount += 1
        await new Promise<void>(resolve => {
          releaseRequest = resolve
        })
        return HttpResponse.json(
          authCodeChallenge('11111111-1111-4111-8111-111111111111'),
          { status: 202 },
        )
      }),
    )

    const user = userEvent.setup()
    renderUserAuthPage(createElement(LoginPage))

    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
    const submitButton = screen.getByRole('button', { name: /enviar código/i })
    const form = submitButton.closest('form')
    expect(form).not.toBeNull()

    fireEvent.submit(form!)
    fireEvent.submit(form!)

    await waitFor(() => expect(requestCount).toBe(1))
    releaseRequest?.()
    expect(await screen.findByText(/código expira em/i)).toBeInTheDocument()
  })

  it('cadastro de usuário usa código de e-mail sem campos de senha', async () => {
    const user = userEvent.setup()
    renderUserAuthPage(createElement(RegisterPage))

    expect(screen.queryByLabelText(/^senha$/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/confirmar senha/i)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText(/nome/i), 'Test User')
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /enviar código/i }))

    const codeDigits = await screen.findAllByLabelText(/código dígito/i)
    await user.type(codeDigits[0], '123456')

    await user.click(screen.getByRole('button', { name: /validar código/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'))
  })

  it('login admin continua usando senha', async () => {
    renderAdminPage()

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
  })
})
