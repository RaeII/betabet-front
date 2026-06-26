import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Info, LogOut, Moon, Settings, Sun, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useAuth } from '@/hooks/useAuth'
import { useJoinRequests } from '@/hooks/useGroups'
import { useTheme } from '@/hooks/useTheme'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

export function GroupGearMenu() {
  const { groupId, group, isAdmin } = useActiveGroup()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const requestsQuery = useJoinRequests(groupId ?? '', Boolean(groupId && isAdmin))
  const pendingRequests = requestsQuery.data?.requests.length ?? 0
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(false)

  if (!groupId || !group) return null

  const isDark = theme === 'dark'
  const userInitial = user?.name.charAt(0).toUpperCase() ?? 'P'

  async function handleLogoutConfirm() {
    setIsLoggingOut(true)
    setLogoutError(false)
    try {
      await logout()
      setLogoutConfirmOpen(false)
    } catch {
      setLogoutError(true)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          aria-label="Ações do grupo"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:text-[var(--text)] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]"
        >
          <Settings size={16} />
          {pendingRequests > 0 ? (
            <span
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-center text-[10px] font-bold leading-none text-[var(--surface)]"
              aria-label={`${pendingRequests} solicitações de novos membros`}
            >
              {pendingRequests > 99 ? '99+' : pendingRequests}
            </span>
          ) : null}
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={6}
            align="end"
            className="z-50 min-w-[12rem] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg outline-none"
          >
            <DropdownMenu.Item
              onSelect={() => navigate('/profile')}
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text)] outline-none data-[highlighted]:bg-[var(--surface-soft)]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-soft)] text-[11px] font-bold text-[var(--brand)]">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  userInitial
                )}
              </span>
              Perfil
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() =>
                navigate(
                  `/groups/${groupId}/membros${pendingRequests > 0 ? '?tab=requests' : ''}`,
                )
              }
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text)] outline-none data-[highlighted]:bg-[var(--surface-soft)]"
            >
              <Users size={14} />
              Membros
              {pendingRequests > 0 ? (
                <span
                  className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-center text-[11px] font-bold leading-none text-[var(--surface)]"
                  aria-label={`${pendingRequests} solicitações pendentes`}
                >
                  {pendingRequests > 99 ? '99+' : pendingRequests}
                </span>
              ) : null}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => navigate(`/groups/${groupId}/detalhes`)}
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text)] outline-none data-[highlighted]:bg-[var(--surface-soft)]"
            >
              <Info size={14} />
              {isAdmin ? 'Configurações do Bolão' : 'Dados do bolão'}
            </DropdownMenu.Item>
                        <DropdownMenu.Item
              onSelect={toggleTheme}
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text)] outline-none data-[highlighted]:bg-[var(--surface-soft)]"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              {isDark ? 'Tema claro' : 'Tema escuro'}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => {
                setLogoutError(false)
                setLogoutConfirmOpen(true)
              }}
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--danger)] outline-none data-[highlighted]:bg-[var(--surface-soft)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
            >
              <LogOut size={14} />
              Sair do app
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Modal
        open={logoutConfirmOpen}
        onOpenChange={open => {
          if (!isLoggingOut) setLogoutConfirmOpen(open)
        }}
        title="Sair do aplicativo?"
        description="Você será desconectado da sua conta neste dispositivo e precisará entrar novamente para acessar seus bolões."
      >
        <div className="flex flex-col gap-3 p-5 sm:flex-row-reverse">
          <Button
            type="button"
            onClick={handleLogoutConfirm}
            disabled={isLoggingOut}
            variant="destructive"
            className="w-full sm:w-auto"
          >
            {isLoggingOut ? 'Saindo…' : 'Sair'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setLogoutConfirmOpen(false)}
            disabled={isLoggingOut}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          {logoutError ? (
            <p
              role="alert"
              className="flex-1 self-center text-sm text-[var(--danger)]"
            >
              Não foi possível sair do aplicativo. Tente novamente.
            </p>
          ) : null}
        </div>
      </Modal>
    </>
  )
}
