interface ScoringExampleProps {
  resultPoints: number
  exactScorePoints: number
}

interface ScenarioRowProps {
  label: string
  bet: string
  points: number
  correct: boolean
}

function ScenarioRow({ label, bet, points, correct }: ScenarioRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--surface-soft)] px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text)]">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">Aposta: {bet}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className={`text-sm font-bold ${correct ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'}`}>
          {points} pontos
        </span>
        <span>{correct ? '✅' : '❌'}</span>
      </div>
    </div>
  )
}

export function ScoringExample({ resultPoints, exactScorePoints }: ScoringExampleProps) {
  return (
    <div className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Exemplo
        </p>
        <div className="mt-2 flex items-center justify-center gap-3 text-lg font-bold text-[var(--text)]">
          <span>🇧🇷 Brasil</span>
          <span className="rounded-[var(--radius-md)] bg-[var(--surface-soft)] px-3 py-1 font-mono text-xl">
            2 × 1
          </span>
          <span>França 🇫🇷</span>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Resultado real da partida</p>
      </div>

      <div className="space-y-2">
        <ScenarioRow
          label="Acertou o placar exato"
          bet="2 × 1"
          points={exactScorePoints}
          correct
        />
        <ScenarioRow
          label="Acertou o vencedor"
          bet="1 × 0 (Brasil vence)"
          points={resultPoints}
          correct
        />
        <ScenarioRow
          label="Errou"
          bet="1 × 1 (empate)"
          points={0}
          correct={false}
        />
      </div>
    </div>
  )
}
