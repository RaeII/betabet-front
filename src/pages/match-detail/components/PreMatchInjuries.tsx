import type { PreviewInjury } from '@/services/matchPreview.service'

interface PreMatchInjuriesProps {
  injuries: PreviewInjury[]
  homeTeamName: string
  awayTeamName: string
}

function InjuryRow({ injury }: { injury: PreviewInjury }) {
  const isOut = injury.type === 'Missing Fixture'
  return (
    <li className="flex items-center gap-3 py-2">
      {injury.photo ? (
        <img
          src={injury.photo}
          alt={injury.playerName}
          loading="lazy"
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-xs font-bold text-[var(--text)]">
          {injury.playerName.charAt(0)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--text)]">{injury.playerName}</p>
        {injury.reason ? (
          <p className="truncate text-xs text-[var(--text-muted)]">{injury.reason}</p>
        ) : null}
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
          isOut
            ? 'bg-[var(--danger)]/12 text-[var(--danger)]'
            : 'bg-[var(--support)]/15 text-[color-mix(in_srgb,var(--support)_70%,var(--text))]'
        }`}
      >
        {isOut ? 'Fora' : 'Dúvida'}
      </span>
    </li>
  )
}

function TeamColumn({ teamName, items }: { teamName: string; items: PreviewInjury[] }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {teamName}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">Nenhum desfalque reportado.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {items.map((i, idx) => (
            <InjuryRow key={`${i.playerId}-${idx}`} injury={i} />
          ))}
        </ul>
      )}
    </div>
  )
}

export function PreMatchInjuries({ injuries, homeTeamName, awayTeamName }: PreMatchInjuriesProps) {
  const home: PreviewInjury[] = []
  const away: PreviewInjury[] = []
  const others: PreviewInjury[] = []
  for (const i of injuries) {
    if (i.teamName === homeTeamName) home.push(i)
    else if (i.teamName === awayTeamName) away.push(i)
    else others.push(i)
  }

  if (injuries.length === 0) return null

  return (
    <section className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Desfalques
        </p>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">
          Quem não vai a campo
        </h3>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <TeamColumn teamName={homeTeamName} items={home} />
        <TeamColumn teamName={awayTeamName} items={away} />
      </div>

      {others.length > 0 ? (
        <p className="text-[10px] text-[var(--text-muted)]">
          {others.length} desfalque(s) relatado(s) sem time mapeado.
        </p>
      ) : null}
    </section>
  )
}
