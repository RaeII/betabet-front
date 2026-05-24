import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/hooks/useActiveGroup', () => ({
  useActiveGroup: () => ({ groupId: 'g1', isAdmin: false }),
}))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u' } }) }))
vi.mock('@/hooks/useGroups', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useGroups')>('@/hooks/useGroups')
  return { ...actual, useUserGroups: () => ({ data: { groups: [] } }) }
})

import { GroupMobileNav } from '@/components/layout/GroupMobileNav'
import { GroupHeader } from '@/components/layout/GroupHeader'

function wrap(component: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        MemoryRouter,
        { initialEntries: ['/groups/g1'] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/groups/:groupId', element: component }),
        ),
      ),
    ),
  )
}

describe('Mobile safe area', () => {
  it('bottom nav respects env(safe-area-inset-bottom)', () => {
    const { container } = wrap(createElement(GroupMobileNav))
    expect(container.innerHTML).toContain('safe-area-inset-bottom')
  })

  it('header respects env(safe-area-inset-top)', () => {
    const { container } = wrap(createElement(GroupHeader))
    expect(container.innerHTML).toContain('safe-area-inset-top')
  })
})
