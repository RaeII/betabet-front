import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createElement } from 'react'
import { AdminGuard } from '@/router/guards/AdminGuard'

vi.mock('@/context/admin.context', () => ({
  useAdminAuthContext: vi.fn(() => ({ isAdminAuthenticated: false, isAdminLoading: false })),
  AdminAuthProvider: ({ children }: { children: React.ReactNode }) =>
    createElement('div', null, children),
}))

function makeWrapper(initialPath: string) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      MemoryRouter,
      { initialEntries: [initialPath] },
      createElement(
        Routes,
        null,
        createElement(Route, { path: '/admin/login', element: createElement('div', null, 'Admin Login') }),
        createElement(
          Route,
          { element: createElement(AdminGuard) },
          createElement(Route, { path: '/admin', element: children }),
        ),
      ),
    )
}

describe('AdminGuard', () => {
  it('redirects non-admin user to /admin/login', () => {
    render(
      createElement('div', null, 'Admin content'),
      { wrapper: makeWrapper('/admin') },
    )

    expect(screen.getByText('Admin Login')).toBeInTheDocument()
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
  })
})
