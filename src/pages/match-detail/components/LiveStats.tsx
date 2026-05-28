import type { LiveTeamStats } from '@/services/liveMatch.service'

interface LiveStatsProps {
  statistics: LiveTeamStats[]
  homeTeamId: number | null
}

// label PT-BR para os tipos vindos da API-Football (ver doc 006 §5)
const LABELS: Record<string, string> = {
  'Ball Possession': 'Posse de bola',
  'Total Shots': 'Chutes totais',
  'Shots on Goal': 'Chutes no alvo',
  'Shots off Goal': 'Chutes para fora',
  'Blocked Shots': 'Chutes bloqueados',
  'Shots insidebox': 'Dentro da área',
  'Shots outsidebox': 'Fora da área',
  Fouls: 'Faltas',
  'Corner Kicks': 'Escanteios',
  Offsides: 'Impedimentos',
  'Yellow Cards': 'Cartões amarelos',
  'Red Cards': 'Cartões vermelhos',
  'Goalkeeper Saves': 'Defesas',
  'Total passes': 'Passes totais',
  'Passes accurate': 'Passes certos',
  'Passes %': '% acerto passes',
  expected_goals: 'xG',
  goals_prevented: 'xGA',
}

// ordem de exibição (resto fica no fim na ordem original)
const PRIORITY = [
  'Ball Possession',
  'Total Shots',
  'Shots on Goal',
  'Corner Kicks',
  'Fouls',
  'Offsides',
  'Yellow Cards',
  'Red Cards',
  'Passes %',
  'expected_goals',
]

const HIDDEN_TYPES = new Set([
  'expected_goals',
  'goals_prevented',
  'Shots insidebox',
  'Shots outsidebox',
  'Goalkeeper Saves',
])

function rawDisplay(value: number | string | null): string {
  if (value === null) return '0'
  return String(value)
}

interface Row {
  type: string
  label: string
  homeRaw: number | string | null
  awayRaw: number | string | null
}

function buildRows(homeStats: LiveTeamStats | null, awayStats: LiveTeamStats | null): Row[] {
  const homeMap = new Map<string, number | string | null>()
  homeStats?.statistics.forEach(s => homeMap.set(s.type, s.value))
  const awayMap = new Map<string, number | string | null>()
  awayStats?.statistics.forEach(s => awayMap.set(s.type, s.value))

  const allTypes = new Set([...homeMap.keys(), ...awayMap.keys()])
  const ordered: string[] = []
  for (const p of PRIORITY) if (allTypes.has(p)) ordered.push(p)
  for (const t of allTypes) if (!ordered.includes(t)) ordered.push(t)

  return ordered
    .filter(type => !HIDDEN_TYPES.has(type))
    .map(type => ({
      type,
      label: LABELS[type] ?? type,
      homeRaw: homeMap.get(type) ?? null,
      awayRaw: awayMap.get(type) ?? null,
    }))
}

function StatRow({ row }: { row: Row }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className="tabular-nums font-bold text-[var(--text)]">{rawDisplay(row.homeRaw)}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {row.label}
      </span>
      <span className="tabular-nums font-bold text-[var(--text)]">{rawDisplay(row.awayRaw)}</span>
    </div>
  )
}

export function LiveStats({ statistics, homeTeamId }: LiveStatsProps) {
  if (statistics.length === 0) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <header className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Estatísticas
        </header>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          As estatísticas começam a aparecer no decorrer do 1º tempo.
        </p>
      </section>
    )
  }

  const homeStats =
    homeTeamId !== null ? statistics.find(s => s.teamId === homeTeamId) ?? null : statistics[0] ?? null
  const awayStats =
    homeTeamId !== null
      ? statistics.find(s => s.teamId !== homeTeamId) ?? null
      : statistics[1] ?? null

  const rows = buildRows(homeStats, awayStats)

  return (
    <section className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        <span>Estatísticas</span>
        <span className="normal-case tracking-normal text-[var(--text-muted)]">
          {homeStats?.teamName ?? 'Mandante'} x {awayStats?.teamName ?? 'Visitante'}
        </span>
      </header>
      <div className="space-y-3">
        {rows.map(row => (
          <StatRow key={row.type} row={row} />
        ))}
      </div>
    </section>
  )
}
