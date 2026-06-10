import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface TableFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  createdFrom: string
  createdTo: string
  onCreatedFromChange: (value: string) => void
  onCreatedToChange: (value: string) => void
  onClear: () => void
}

/** Barra de filtros compartilhada: busca textual + intervalo de data de cadastro. */
export function TableFilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  createdFrom,
  createdTo,
  onCreatedFromChange,
  onCreatedToChange,
  onClear,
}: TableFilterBarProps) {
  const hasFilters = Boolean(search || createdFrom || createdTo)

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <Input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-muted)]">
        Cadastro de
        <Input
          type="date"
          value={createdFrom}
          onChange={e => onCreatedFromChange(e.target.value)}
          className="min-h-10 w-[150px]"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-muted)]">
        até
        <Input
          type="date"
          value={createdTo}
          onChange={e => onCreatedToChange(e.target.value)}
          className="min-h-10 w-[150px]"
        />
      </label>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="flex min-h-10 items-center gap-1 rounded-[var(--radius-md)] px-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          <X size={14} />
          Limpar
        </button>
      )}
    </div>
  )
}
