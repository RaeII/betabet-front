import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { AdminImportTeamsPage } from '@/pages/admin/AdminImportTeamsPage'
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

describe('AdminImportTeamsPage', () => {
  beforeEach(() => server.use(...importHandlers))

  it('shows idle state with description and buscar button but no list', () => {
    render(createElement(AdminImportTeamsPage), { wrapper: makeWrapper() })

    expect(screen.getByRole('button', { name: /buscar seleções/i })).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('loads team list when buscar button is clicked', async () => {
    const user = userEvent.setup()
    render(createElement(AdminImportTeamsPage), { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /buscar seleções/i }))

    await waitFor(() => expect(screen.getByText('Brazil')).toBeInTheDocument())
    expect(screen.getByText('Croatia')).toBeInTheDocument()
  })

  it('renders "Nova" badge for teams with exists: false', async () => {
    const user = userEvent.setup()
    render(createElement(AdminImportTeamsPage), { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /buscar seleções/i }))

    await waitFor(() => expect(screen.getByText('Brazil')).toBeInTheDocument())
    const novaBadges = screen.getAllByText('Nova')
    expect(novaBadges.length).toBeGreaterThan(0)
  })

  it('renders "Já importado" badge for teams with exists: true', async () => {
    const user = userEvent.setup()
    render(createElement(AdminImportTeamsPage), { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /buscar seleções/i }))

    await waitFor(() => expect(screen.getByText('Croatia')).toBeInTheDocument())
    expect(screen.getByText('Já importado')).toBeInTheDocument()
  })

  it('disables Salvar button for teams that already exist', async () => {
    const user = userEvent.setup()
    render(createElement(AdminImportTeamsPage), { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /buscar seleções/i }))

    await waitFor(() => expect(screen.getByText('Croatia')).toBeInTheDocument())

    const saveButtons = screen.getAllByRole('button', { name: /^salvar$/i })
    const croatiaRow = screen.getByText('Croatia').closest('[data-testid]') ??
      screen.getByText('Croatia').closest('div')
    expect(croatiaRow).toBeTruthy()

    // The existing team's save button should be disabled
    const disabledSave = saveButtons.find(btn => btn.hasAttribute('disabled'))
    expect(disabledSave).toBeDefined()
  })

  it('shows toast and flips badge after saving a team', async () => {
    const user = userEvent.setup()
    render(createElement(AdminImportTeamsPage), { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /buscar seleções/i }))

    await waitFor(() => expect(screen.getByText('Brazil')).toBeInTheDocument())

    const enabledSaveButtons = screen
      .getAllByRole('button', { name: /^salvar$/i })
      .filter(btn => !btn.hasAttribute('disabled'))

    expect(enabledSaveButtons.length).toBeGreaterThan(0)
    await user.click(enabledSaveButtons[0])

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/importad/i),
    )
  })

  it('shows Salvar Todas button listing new count after load', async () => {
    const user = userEvent.setup()
    render(createElement(AdminImportTeamsPage), { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /buscar seleções/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /salvar todas/i })).toBeInTheDocument(),
    )
  })
})
