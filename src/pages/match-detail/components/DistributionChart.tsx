import { formatPct } from '@/lib/format.utils'
import type { DistributionData } from '@/types/match.types'

interface DistributionChartProps {
  data: DistributionData
  homeTeamName: string
  awayTeamName: string
}

interface BarProps {
  label: string
  pct: number
  color: string
}

function Bar({ label, pct, color }: BarProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{label}</span>
        <span className="font-semibold text-[var(--text)]">{formatPct(pct)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export function DistributionChart({ data, homeTeamName, awayTeamName }: DistributionChartProps) {
  return (
    <div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text)]">Palpite da galera</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Mostra a proporção dos palpites enviados por todos os usuários para este jogo.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Bar label={homeTeamName} pct={data.homePct} color="var(--brand)" />
        <Bar label="Empate" pct={data.drawPct} color="var(--text-muted)" />
        <Bar label={awayTeamName} pct={data.awayPct} color="var(--support)" />
      </div>
    </div>
  )
}
