import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getGroupStats } from '@/services/admin.service'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { GroupSortField, SortDir } from '@/types/admin.types'
import { TableFilterBar } from './TableFilterBar'
import { SortHeader } from './SortHeader'
import { Pagination } from './Pagination'

const LIMIT = 20

export function GroupsPanel() {
  const [search, setSearch] = useState('')
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')
  const [sortBy, setSortBy] = useState<GroupSortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search, 350)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'groups-analytics', { debouncedSearch, createdFrom, createdTo, sortBy, sortDir, page }],
    queryFn: () =>
      getGroupStats({
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

  function handleSort(field: GroupSortField) {
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

  const groups = data?.groups ?? []

  return (
    <section className="space-y-4">
      <TableFilterBar
        search={search}
        onSearchChange={v => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Buscar por nome do bolão…"
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
                <SortHeader field="name" label="Bolão" activeField={sortBy} dir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-muted)]">Admin</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-muted)]">Entrada</th>
                <SortHeader field="memberCount" label="Membros" activeField={sortBy} dir={sortDir} onSort={handleSort} className="text-right" />
                <SortHeader field="createdAt" label="Criado em" activeField={sortBy} dir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    Carregando bolões…
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    Nenhum bolão encontrado.
                  </td>
                </tr>
              ) : (
                groups.map(g => (
                  <tr key={g.groupId} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--text)]">{g.name}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{g.adminName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                        {g.joinMode === 'invite' ? 'Convite' : 'Solicitação'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--text)]">{g.memberCount}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {new Date(g.createdAt).toLocaleDateString('pt-BR')}
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
