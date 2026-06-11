import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { PreviewRecentForm, PreviewRecentFormGame, PreviewRecentFormSide } from '@/services/matchPreview.service'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'
import { cn } from '@/lib/utils'

interface RegisteredTeam {
  /** id interno do time (resolve a bandeira cadastrada / base64). */
  id: string
  name: string
  flagUrl: string
}

interface PreMatchRecentFormProps {
  recentForm: PreviewRecentForm
  homeTeam: RegisteredTeam
  awayTeam: RegisteredTeam
}

const RESULT_LABEL: Record<'W' | 'D' | 'L', string> = { W: 'Vitória', D: 'Empate', L: 'Derrota' }

const RESULT_PILL: Record<'W' | 'D' | 'L', string> = {
  W: 'border-transparent bg-[var(--brand)] text-[var(--brand-text)]',
  D: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]',
  L: 'border-transparent bg-[var(--danger)] text-white',
}

type ScoreSide =
  | {
      kind: 'selected'
      name: string
      score: number | null
      team: RegisteredTeam
    }
  | {
      kind: 'opponent'
      name: string
      score: number | null
      opponent: PreviewRecentFormGame['opponent']
    }

interface GoalAverage {
  scored: string
  conceded: string
  sampleSize: number
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatGoalAverage(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

function calculateGoalAverage(form: PreviewRecentFormSide): GoalAverage | null {
  const gamesWithScore = form.games.filter(game => game.goalsFor !== null && game.goalsAgainst !== null)
  if (gamesWithScore.length === 0) return null

  const totals = gamesWithScore.reduce(
    (acc, game) => ({
      scored: acc.scored + (game.goalsFor ?? 0),
      conceded: acc.conceded + (game.goalsAgainst ?? 0),
    }),
    { scored: 0, conceded: 0 },
  )

  return {
    scored: formatGoalAverage(totals.scored / gamesWithScore.length),
    conceded: formatGoalAverage(totals.conceded / gamesWithScore.length),
    sampleSize: gamesWithScore.length,
  }
}

/** Bandeira do adversário: renderizada pela URL da API-Football. */
function OpponentFlag({ logo, name, className }: { logo: string | null; name: string; className?: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={`Bandeira ${name}`}
        loading="lazy"
        className={cn('h-5 w-7 shrink-0 rounded object-contain', className)}
      />
    )
  }
  return (
    <span
      className={cn(
        'inline-flex h-5 w-7 shrink-0 items-center justify-center rounded bg-[var(--surface)] text-[10px] font-bold text-[var(--text-muted)]',
        className,
      )}
    >
      {name.charAt(0)}
    </span>
  )
}

function ScoreFlag({ side }: { side: ScoreSide }) {
  if (side.kind === 'selected') {
    return (
      <TeamFlagImage
        src={side.team.flagUrl}
        teamId={side.team.id}
        alt={`Bandeira ${side.team.name}`}
        className="h-5 w-7 shrink-0 rounded object-contain shadow-sm"
      />
    )
  }

  return <OpponentFlag logo={side.opponent.logo} name={side.opponent.name} />
}

function ScoreTeam({ side, align }: { side: ScoreSide; align: 'left' | 'right' }) {
  const name = (
    <span
      className={cn(
        'min-w-0 truncate text-xs sm:text-sm',
        side.kind === 'selected' ? 'font-semibold text-[var(--text)]' : 'font-medium text-[var(--text)]',
      )}
    >
      {side.name}
    </span>
  )
  const flag = <ScoreFlag side={side} />

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-1.5',
        align === 'left' ? 'justify-end text-right' : 'justify-start text-left',
      )}
    >
      {align === 'left' ? (
        <>
          {name}
          {flag}
        </>
      ) : (
        <>
          {flag}
          {name}
        </>
      )}
    </div>
  )
}

function formatScoreValue(value: number | null): string {
  return value === null ? '—' : String(value)
}

function GameRow({ game, team }: { game: PreviewRecentFormGame; team: RegisteredTeam }) {
  const selectedSide: ScoreSide = {
    kind: 'selected',
    name: team.name,
    score: game.goalsFor,
    team,
  }
  const opponentSide: ScoreSide = {
    kind: 'opponent',
    name: game.opponent.name,
    score: game.goalsAgainst,
    opponent: game.opponent,
  }
  const hasScore = selectedSide.score !== null && opponentSide.score !== null
  const resultLabel = game.result ? RESULT_LABEL[game.result] : 'Sem resultado'

  return (
    <li className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {game.venue === 'home' ? 'Casa' : 'Fora'}
          {game.date ? ` · ${formatShortDate(game.date)}` : ''}
        </span>

        <span
          className={cn(
            'inline-flex h-6 shrink-0 items-center rounded-[var(--radius-pill)] border px-2.5 text-[10px] font-bold uppercase tracking-[0.08em]',
            game.result ? RESULT_PILL[game.result] : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]',
          )}
          aria-label={`Resultado de ${team.name}: ${resultLabel}`}
        >
          {resultLabel}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <ScoreTeam side={selectedSide} align="left" />

        <span
          className={cn(
            'grid min-w-[4.75rem] grid-cols-[1fr_auto_1fr] items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-mono text-sm font-bold tabular-nums text-[var(--text)]',
            !hasScore && 'text-[var(--text-muted)]',
          )}
          aria-label={
            hasScore
              ? `${team.name} ${selectedSide.score}, ${game.opponent.name} ${opponentSide.score}`
              : `Placar indisponível para ${team.name} contra ${game.opponent.name}`
          }
        >
          <span className="text-right">{formatScoreValue(selectedSide.score)}</span>
          <span className="px-1 text-[var(--text-muted)]">×</span>
          <span>{formatScoreValue(opponentSide.score)}</span>
        </span>

        <ScoreTeam side={opponentSide} align="right" />
      </div>
    </li>
  )
}

function TeamForm({ team, form, sideLabel }: { team: RegisteredTeam; form: PreviewRecentFormSide; sideLabel: string }) {
  const goalAverage = calculateGoalAverage(form)
  const [showGames, setShowGames] = useState(true)
  const gamesId = `recent-form-games-${team.id}`

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Seleção cadastrada → mantém o sistema de bandeiras (teamId/base64). */}
          <TeamFlagImage
            src={team.flagUrl}
            teamId={team.id}
            alt={`Bandeira ${team.name}`}
            className="h-7 w-9 shrink-0 rounded object-contain shadow-sm"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {sideLabel}
            </p>
            <p className="truncate text-sm font-semibold text-[var(--text)] sm:text-base">{team.name}</p>
            {goalAverage ? (
              <p
                className="mt-0.5 text-[11px] leading-4 text-[var(--text-muted)]"
                aria-label={`Média em ${goalAverage.sampleSize} jogos com placar: ${goalAverage.scored} gols feitos e ${goalAverage.conceded} sofridos por jogo`}
              >
                Média:{' '}
                <span className="font-semibold text-[var(--text)]">{goalAverage.scored}</span> feitos ·{' '}
                <span className="font-semibold text-[var(--text)]">{goalAverage.conceded}</span> sofridos
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)]"
          >
            {form.wins}V {form.draws}E {form.losses}D
          </span>
          <button
            type="button"
            aria-expanded={showGames}
            aria-controls={gamesId}
            onClick={() => setShowGames((curr) => !curr)}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 text-[11px] font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]"
          >
            {showGames ? (
              <>
                Ocultar jogos
                <ChevronUp aria-hidden="true" className="h-3 w-3" />
              </>
            ) : (
              <>
                Mostrar jogos
                <ChevronDown aria-hidden="true" className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </div>

      {showGames && (
        <div id={gamesId}>
          {form.games.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">Sem jogos recentes.</p>
          ) : (
            <ul className="space-y-2">
              {form.games.map(g => (
                <GameRow key={g.fixtureId} game={g} team={team} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export function PreMatchRecentForm({ recentForm, homeTeam, awayTeam }: PreMatchRecentFormProps) {
  const { home, away } = recentForm

  if (!home && !away) return null

  return (
    <section className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <header>
        <h3 className="text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">
          Últimos jogos
        </h3>
      </header>

      <div className="space-y-5">
        {home ? <TeamForm team={homeTeam} form={home} sideLabel="Mandante" /> : null}
        {home && away ? <div className="h-px bg-[var(--border)]" /> : null}
        {away ? <TeamForm team={awayTeam} form={away} sideLabel="Visitante" /> : null}
      </div>
    </section>
  )
}
