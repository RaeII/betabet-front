import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getUserStats } from '@/services/admin.service'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { SortDir, UserSortField } from '@/types/admin.types'
import { TableFilterBar } from './TableFilterBar'
import { SortHeader } from './SortHeader'
import { Pagination } from './Pagination'

const LIMIT = 20

export function UsersPanel() {
  const [search, setSearch] = useState('')
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')
  const [sortBy, setSortBy] = useState<UserSortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search, 350)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'users', { debouncedSearch, createdFrom, createdTo, sortBy, sortDir, page }],
    queryFn: () =>
      getUserStats({
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        sortBy,
        sortDir,
      }),
    placeholderData: keepPreviousData,
  })

  function handleSort(field: UserSortField) {
    if (field === sortBy) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir(field === 'name' ? 'asc' : 'desc')
    }
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setCreatedFrom('')
    setCreatedTo('')
    setPage(1)
  }

  const users = data?.users ?? []

  return (
    <section className="space-y-4">
      <TableFilterBar
        search={search}
        onSearchChange={v => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Buscar por nome ou e-mail…"
        createdFrom={createdFrom}
        createdTo={createdTo}
        onCreatedFromChange={v => {
          setCreatedFrom(v)
          setPage(1)
        }}
        onCreatedToChange={v => {
          setCreatedTo(v)
          setPage(1)
        }}
        onClear={clearFilters}
      />

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-xs uppercase tracking-wide">
              <tr>
                <SortHeader field="name" label="Usuário" activeField={sortBy} dir={sortDir} onSort={handleSort} />
                <SortHeader field="groupsCreated" label="Bolões" activeField={sortBy} dir={sortDir} onSort={handleSort} className="text-right" />
                <SortHeader field="referralCount" label="Indicações" activeField={sortBy} dir={sortDir} onSort={handleSort} className="text-right" />
                <SortHeader field="totalBets" label="Palpites" activeField={sortBy} dir={sortDir} onSort={handleSort} className="text-right" />
                <SortHeader field="createdAt" label="Cadastro" activeField={sortBy} dir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    Carregando usuários…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.userId} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text)]">{u.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{u.email || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--text)]">{u.groupsCreated}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--text)]">{u.referralCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--text)]">{u.totalBets}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} limit={LIMIT} total={data?.total ?? 0} onPageChange={setPage} />
      </div>
    </section>
  )
}
