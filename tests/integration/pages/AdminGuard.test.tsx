import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { AdminGuard } from '@/router/guards/AdminGuard'
import { AuthProvider } from '@/context/auth.context'
import { server } from '../../mocks/server'
import { authHandlers } from '../../mocks/handlers/auth.handlers'

function makeWrapper(initialPath: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        AuthProvider,
        null,
        createElement(
          MemoryRouter,
          { initialEntries: [initialPath] },
          createElement(Routes, null,
            createElement(Route, { path: '/', element: createElement('div', null, 'Home') }),
            createElement(Route, { element: createElement(AdminGuard) },
              createElement(Route, { path: '/admin', element: children }),
            ),
          ),
        ),
      ),
    )
}

describe('AdminGuard', () => {
  beforeEach(() => server.use(...authHandlers))

  it('redirects non-admin user to /', async () => {
    render(
      createElement('div', null, 'Admin content'),
      { wrapper: makeWrapper('/admin') },
    )

    await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument())
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
  })
})
