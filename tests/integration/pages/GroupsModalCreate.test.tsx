import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

const createMutate = vi.fn()
vi.mock('@/hooks/useGroups', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useGroups')>('@/hooks/useGroups')
  return {
    ...actual,
    useUserGroups: vi.fn(() => ({ data: { groups: [] } })),
    useCreateGroup: () => ({ mutate: createMutate, isPending: false, isError: false }),
  }
})
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

import { GroupsModal } from '@/pages/groups/components/GroupsModal'

function renderModal() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        MemoryRouter,
        null,
        createElement(GroupsModal, {
          open: true,
          onOpenChange: vi.fn(),
          activeGroupId: null,
        }),
      ),
    ),
  )
}

describe('GroupsModal (creation mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders identity step then scoring step in inline wizard', async () => {
    renderModal()

    fireEvent.click(screen.getByRole('button', { name: /Criar novo grupo/i }))
    expect(screen.getByText(/Como vai chamar o grupo/i)).toBeInTheDocument()

    const nameInput = screen.getByLabelText(/Nome do grupo/i)
    fireEvent.change(nameInput, { target: { value: 'Meu Bolão' } })

    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }))
    expect(await screen.findByText(/Quanto vale cada aposta/i)).toBeInTheDocument()
  })

  it('calls createGroup mutation on submit (not navigate directly)', async () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /Criar novo grupo/i }))

    const nameInput = screen.getByLabelText(/Nome do grupo/i)
    fireEvent.change(nameInput, { target: { value: 'Bolão da Família' } })
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i }))

    await screen.findByText(/Quanto vale cada aposta/i)

    // submit
    fireEvent.click(screen.getByRole('button', { name: /Criar grupo/i }))

    await waitFor(() => expect(createMutate).toHaveBeenCalled())
    expect(mockNavigate).not.toHaveBeenCalled() // navigate only fires onSuccess via the mutation callback
  })
})
