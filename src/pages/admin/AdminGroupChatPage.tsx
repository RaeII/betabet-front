import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckSquare,
  Loader2,
  MessageCircle,
  MessageCircleOff,
  Search,
  Square,
  Users,
} from 'lucide-react'
import { listAdminGroups, setGroupChatEnabled } from '@/services/admin.service'
import { ApiRequestError } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/context/toast.context'
import { cn } from '@/lib/utils'

interface ToggleChatVars {
  groupIds: string[]
  chatEnabled: boolean
}

function groupLabel(count: number) {
  return count === 1 ? '1 bolão' : `${count} bolões`
}

export function AdminGroupChatPage() {
  const qc = useQueryClient()
  const toast = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'groups-list'],
    queryFn: listAdminGroups,
  })

  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pendingIds, setPendingIds] = useState<string[]>([])

  const groups = data?.groups ?? []

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return groups
    return groups.filter(group => group.name.toLowerCase().includes(term))
  }, [groups, search])

  const selectedGroups = useMemo(
    () => groups.filter(group => selectedIds.includes(group.id)),
    [groups, selectedIds],
  )
  const visibleIds = useMemo(() => filteredGroups.map(group => group.id), [filteredGroups])
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id))
  const enabledCount = groups.filter(group => group.chatEnabled).length
  const disabledCount = groups.length - enabledCount

  const toggleChat = useMutation({
    mutationFn: async ({ groupIds, chatEnabled }: ToggleChatVars) => {
      await Promise.all(groupIds.map(groupId => setGroupChatEnabled(groupId, chatEnabled)))
      return { count: groupIds.length, chatEnabled }
    },
    onMutate: vars => {
      setPendingIds(vars.groupIds)
    },
    onSuccess: (result, vars) => {
      setSelectedIds(prev => prev.filter(id => !vars.groupIds.includes(id)))
      void qc.invalidateQueries({ queryKey: ['admin', 'groups-list'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'groups'] })
      void qc.invalidateQueries({ queryKey: ['groups'] })
      toast({
        title: `${groupLabel(result.count)} com chat ${result.chatEnabled ? 'liberado' : 'oculto'}.`,
        variant: 'success',
      })
    },
    onError: err => {
      const msg =
        err instanceof ApiRequestError ? err.message : 'Erro ao atualizar chat dos bolões.'
      toast({ title: msg, variant: 'error' })
    },
    onSettled: () => {
      setPendingIds([])
    },
  })

  function toggleSelected(groupId: string) {
    setSelectedIds(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId],
    )
  }

  function toggleVisibleSelection() {
    setSelectedIds(prev => {
      const visible = new Set(visibleIds)
      if (allVisibleSelected) return prev.filter(id => !visible.has(id))
      return Array.from(new Set([...prev, ...visibleIds]))
    })
  }

  function updateSelected(chatEnabled: boolean) {
    const groupIds = selectedGroups
      .filter(group => group.chatEnabled !== chatEnabled)
      .map(group => group.id)

    if (groupIds.length === 0) {
      toast({
        title: `Os bolões selecionados já estão com o chat ${chatEnabled ? 'liberado' : 'oculto'}.`,
      })
      return
    }

    toggleChat.mutate({ groupIds, chatEnabled })
  }

  if (isLoading) {
    return <div className="text-[var(--text-muted)]">Carregando…</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Chat dos bolões</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Libera ou oculta o ícone do chat no frontend para bolões selecionados. Bolões novos
          começam com o chat oculto.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Total
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--text)]">{groups.length}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Liberados
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--brand)]">{enabledCount}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Ocultos
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--text)]">{disabledCount}</p>
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar bolão pelo nome…"
          className="pl-10"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={visibleIds.length === 0 || toggleChat.isPending}
            onClick={toggleVisibleSelection}
          >
            {allVisibleSelected ? <CheckSquare size={14} /> : <Square size={14} />}
            {allVisibleSelected ? 'Limpar visíveis' : 'Selecionar visíveis'}
          </Button>
          <span className="text-sm text-[var(--text-muted)]">
            {groupLabel(selectedIds.length)} selecionado(s)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={selectedIds.length === 0 || toggleChat.isPending}
            onClick={() => updateSelected(true)}
          >
            <MessageCircle size={14} />
            Ativar selecionados
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={selectedIds.length === 0 || toggleChat.isPending}
            onClick={() => updateSelected(false)}
          >
            <MessageCircleOff size={14} />
            Ocultar selecionados
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {filteredGroups.map(group => {
          const isSelected = selectedIds.includes(group.id)
          const isPending = pendingIds.includes(group.id)

          return (
            <div
              key={group.id}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-lg)] border bg-[var(--surface)] p-3 transition-colors',
                isSelected ? 'border-[var(--brand)]' : 'border-[var(--border)]',
              )}
            >
              <button
                type="button"
                aria-label={isSelected ? 'Remover seleção' : 'Selecionar bolão'}
                aria-pressed={isSelected}
                disabled={toggleChat.isPending}
                onClick={() => toggleSelected(group.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)] disabled:opacity-50"
              >
                {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{group.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Users size={12} />
                  {group.memberCount} membro(s)
                </p>
              </div>

              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-1 text-xs font-semibold',
                  group.chatEnabled
                    ? 'bg-[var(--brand)]/10 text-[var(--brand)]'
                    : 'bg-[var(--surface-soft)] text-[var(--text-muted)]',
                )}
              >
                {group.chatEnabled ? 'Ativo' : 'Oculto'}
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={group.chatEnabled}
                aria-label={`${group.chatEnabled ? 'Ocultar' : 'Ativar'} chat de ${group.name}`}
                disabled={toggleChat.isPending}
                onClick={() =>
                  toggleChat.mutate({
                    groupIds: [group.id],
                    chatEnabled: !group.chatEnabled,
                  })
                }
                className={cn(
                  'relative h-7 w-12 shrink-0 rounded-full border transition-colors disabled:opacity-50',
                  group.chatEnabled
                    ? 'border-[var(--brand)] bg-[var(--brand)]'
                    : 'border-[var(--border)] bg-[var(--surface-soft)]',
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    group.chatEnabled ? 'translate-x-5' : 'translate-x-1',
                  )}
                />
                {isPending && (
                  <Loader2
                    size={14}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-[var(--text-muted)]"
                  />
                )}
              </button>
            </div>
          )
        })}

        {filteredGroups.length === 0 && (
          <p className="col-span-full text-sm text-[var(--text-muted)]">Nenhum bolão encontrado.</p>
        )}
      </div>
    </div>
  )
}
