import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

vi.mock('@/hooks/useLastAccessedGroup', () => ({
  useLastAccessedGroup: vi.fn(),
}))

import { useLastAccessedGroup } from '@/hooks/useLastAccessedGroup'
import { RootResolver } from '@/router/RootResolver'

const mockedHook = useLastAccessedGroup as ReturnType<typeof vi.fn>

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<RootResolver />} />
        <Route path="/onboarding" element={<div data-testid="onb">Onboarding</div>} />
        <Route path="/groups/:groupId" element={<div data-testid="group">Group page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RootResolver', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to onboarding when user has 0 groups', () => {
    mockedHook.mockReturnValue({ groupId: null, isReady: true, reason: 'none' })
    renderWithRouter()
    expect(screen.getByTestId('onb')).toBeInTheDocument()
  })

  it('redirects to single group', () => {
    mockedHook.mockReturnValue({ groupId: 'g-only', isReady: true, reason: 'single' })
    renderWithRouter()
    expect(screen.getByTestId('group')).toBeInTheDocument()
  })

  it('redirects to stored group when present', () => {
    mockedHook.mockReturnValue({ groupId: 'g-stored', isReady: true, reason: 'stored' })
    renderWithRouter()
    expect(screen.getByTestId('group')).toBeInTheDocument()
  })

  it('does not flash intermediate UI when not ready', () => {
    mockedHook.mockReturnValue({ groupId: null, isReady: false, reason: 'none' })
    renderWithRouter()
    expect(screen.queryByTestId('onb')).not.toBeInTheDocument()
    expect(screen.queryByTestId('group')).not.toBeInTheDocument()
  })
})
