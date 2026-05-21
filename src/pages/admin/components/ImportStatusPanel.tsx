import { useImportStatus } from '@/hooks/useImportStatus'

export function ImportStatusPanel() {
  const { data, isPending } = useImportStatus()

  if (isPending) {
    return (
      <div className="flex gap-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="h-4 w-40 animate-pulse rounded bg-[var(--surface-soft)]" />
        <div className="h-4 w-40 animate-pulse rounded bg-[var(--surface-soft)]" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-wrap gap-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
      <span className="text-[var(--text-muted)]">
        Seleções:{' '}
        <strong className="text-[var(--text)]">
          {data.teamsInDb} / {data.teamsInApi}
        </strong>{' '}
        importadas
      </span>
      <span className="text-[var(--text-muted)]">
        Partidas:{' '}
        <strong className="text-[var(--text)]">
          {data.matchesInDb} / {data.matchesInApi}
        </strong>{' '}
        importadas
      </span>
    </div>
  )
}
