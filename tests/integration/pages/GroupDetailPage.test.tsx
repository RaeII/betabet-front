import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { GroupDetailPage } from '@/pages/groups/GroupDetailPage'
import { AuthProvider } from '@/context/auth.context'
import { server } from '../../mocks/server'
import { groupsHandlers } from './groups.handlers'
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
        createElement(
          MemoryRouter,
          { initialEntries: ['/groups/group-1'] },
          createElement(Routes, null,
            createElement(Route, { path: '/groups/:groupId', element: children }),
          ),
        ),
      ),
    )
}

describe('GroupDetailPage', () => {
  beforeEach(() => server.use(...authHandlers, ...groupsHandlers))

  it('renders the group name', async () => {
    render(createElement(GroupDetailPage), { wrapper: makeWrapper() })

    await waitFor(() => expect(screen.getByText('Bolão dos Amigos')).toBeInTheDocument())
  })
})
