import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { AdminImportMatchesPage } from '@/pages/admin/AdminImportMatchesPage'
import { ToastProvider } from '@/context/toast.context'
import { server } from '../../mocks/server'
import { importHandlers } from '../../mocks/handlers/import.handlers'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: qc },
      createElement(
        ToastProvider,
        null,
        createElement(MemoryRouter, null, children),
      ),
    )
}

describe('AdminImportMatchesPage', () => {
  beforeEach(() => server.use(...importHandlers))

  it('shows idle state with description, dependency notice and buscar button but no list', () => {
    render(createElement(AdminImportMatchesPage), { wrapper: makeWrapper() })

    expect(screen.getByRole('button', { name: /buscar partidas/i })).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows dependency warning in idle state', () => {
    render(createElement(AdminImportMatchesPage), { wrapper: makeWrapper() })

    expect(screen.getByText(/seleções devem ser importadas/i)).toBeInTheDocument()
  })

  it('loads match list when buscar button is clicked', async () => {
    const user = userEvent.setup()
    render(createElement(AdminImportMatchesPage), { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /buscar partidas/i }))

    // Both mock matches feature Brazil, so use getAllByText
    await waitFor(() => expect(screen.getAllByText('Brazil').length).toBeGreaterThan(0))
    expect(screen.getAllByText('Croatia').length).toBeGreaterThan(0)
  })

  it('renders "Times ausentes" badge for matches with teamsImported: false', async () => {
    const user = userEvent.setup()
    render(createElement(AdminImportMatchesPage), { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /buscar partidas/i }))

    await waitFor(() => expect(screen.getAllByText('Brazil').length).toBeGreaterThan(0))
    expect(screen.getByText('Times ausentes')).toBeInTheDocument()
  })

  it('disables Salvar button for matches with teamsImported: false', async () => {
    const user = userEvent.setup()
    render(createElement(AdminImportMatchesPage), { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /buscar partidas/i }))

    await waitFor(() => expect(screen.getByText('Times ausentes')).toBeInTheDocument())

    const disabledSaveButtons = screen
      .getAllByRole('button', { name: /^salvar$/i })
      .filter(btn => btn.hasAttribute('disabled'))

    expect(disabledSaveButtons.length).toBeGreaterThan(0)
  })

  it('saves an eligible match and shows success toast', async () => {
    const user = userEvent.setup()
    render(createElement(AdminImportMatchesPage), { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /buscar partidas/i }))

    await waitFor(() => expect(screen.getAllByRole('button', { name: /^salvar$/i }).length).toBeGreaterThan(0))

    const enabledSaveButtons = screen
      .getAllByRole('button', { name: /^salvar$/i })
      .filter(btn => !btn.hasAttribute('disabled'))

    expect(enabledSaveButtons.length).toBeGreaterThan(0)
    await user.click(enabledSaveButtons[0])

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/importad/i),
    )
  })

  it('shows Salvar Todas button after matches are loaded', async () => {
    const user = userEvent.setup()
    render(createElement(AdminImportMatchesPage), { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /buscar partidas/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /salvar todas/i })).toBeInTheDocument(),
    )
  })
})
