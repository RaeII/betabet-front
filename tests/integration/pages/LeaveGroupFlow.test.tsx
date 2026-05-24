import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

const mockMutate = vi.fn()
const mockNavigate = vi.fn()
const mockClearLast = vi.fn()
const mockInvalidate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/hooks/useLeaveGroup', () => ({
  useLeaveGroup: () => ({
    mutate: mockMutate,
    isPending: false,
    isError: false,
  }),
}))

import { LeaveGroupConfirm } from '@/pages/groups/components/LeaveGroupConfirm'

function renderConfirm(open = true) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        MemoryRouter,
        null,
        createElement(LeaveGroupConfirm, {
          open,
          onOpenChange: vi.fn(),
          groupId: 'g1',
          groupName: 'Bolão Alpha',
        }),
      ),
    ),
  )
}

describe('LeaveGroupFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    void mockClearLast
    void mockInvalidate
  })

  it('keeps membership unchanged when canceling', () => {
    renderConfirm()
    const cancel = screen.getByRole('button', { name: /Cancelar/i })
    fireEvent.click(cancel)
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('confirm triggers leave mutation', async () => {
    renderConfirm()
    fireEvent.click(screen.getByRole('button', { name: /^Sair$/ }))
    await waitFor(() => expect(mockMutate).toHaveBeenCalled())
  })
})
