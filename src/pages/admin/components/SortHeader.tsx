import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SortDir } from '@/types/admin.types'

interface SortHeaderProps<TField extends string> {
  field: TField
  label: string
  activeField: TField
  dir: SortDir
  onSort: (field: TField) => void
  className?: string
}

/** Cabeçalho de coluna clicável que alterna a ordenação da tabela. */
export function SortHeader<TField extends string>({
  field,
  label,
  activeField,
  dir,
  onSort,
  className,
}: SortHeaderProps<TField>) {
  const isActive = activeField === field
  const Icon = !isActive ? ChevronsUpDown : dir === 'asc' ? ChevronUp : ChevronDown

  return (
    <th className={cn('px-4 py-3 text-left font-semibold', className)}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          'inline-flex items-center gap-1 transition-colors hover:text-[var(--text)]',
          isActive ? 'text-[var(--text)]' : 'text-[var(--text-muted)]',
        )}
      >
        {label}
        <Icon size={14} className={isActive ? 'text-[var(--brand)]' : 'opacity-60'} />
      </button>
    </th>
  )
}
