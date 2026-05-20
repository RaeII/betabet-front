interface StatsCardProps {
  label: string
  value: number | string
}

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[var(--text)]">{value}</p>
    </div>
  )
}
