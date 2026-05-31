import { useState } from 'react'
import { User } from 'lucide-react'
import type { PreviewLineup, PreviewLineupPlayer } from '@/services/matchPreview.service'

const PITCH_WIDTH = 112
const PITCH_HEIGHT = 72
const PLAYER_MIN_Y = 8
const PLAYER_Y_RANGE = 56

interface PreMatchLineupProps {
  lineups: PreviewLineup[]
  /** Header opcional — default "Escalação provável" (pré-jogo). Em live, passe "Escalação". */
  headerLabel?: string
  /** Placeholder quando lineups está vazio (pré-jogo: ~30-60 min antes; live: API sem cobertura). */
  emptyMessage?: string
}

/**
 * Lê `grid: "linha:coluna"` da API-Football. Retorna coordenadas 0–1 para
 * posicionamento no SVG. Para o lado away o eixo Y é espelhado para que
 * os goleiros fiquem nas extremidades do campo.
 */
function parseGrid(grid: string | null): { row: number; col: number } | null {
  if (!grid) return null
  const [r, c] = grid.split(':').map((n) => Number(n.trim()))
  if (!Number.isFinite(r) || !Number.isFinite(c)) return null
  return { row: r, col: c }
}

function ensureColor(hex: string | undefined | null, fallback: string): string {
  if (!hex) return fallback
  const trimmed = hex.replace('#', '').trim()
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) return `#${trimmed}`
  return fallback
}

interface PlayerDotProps {
  player: PreviewLineupPlayer
  cx: number
  cy: number
  fill: string
  stroke: string
  textColor: string
}

function PlayerDot({ player, cx, cy, fill, stroke, textColor }: PlayerDotProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="4" fill={fill} stroke={stroke} strokeWidth="0.30" />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        fontSize="3.1"
        fontWeight="700"
        fill={textColor}
      >
        {player.number ?? ''}
      </text>
      <text
        x={cx}
        y={cy + 7.3}
        textAnchor="middle"
        fontSize="3"
        fontWeight="600"
        fill="var(--text)"
        stroke="var(--surface)"
        strokeWidth="0.55"
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {player.name.length > 12 ? player.name.split(' ').slice(-1)[0] : player.name}
      </text>
    </g>
  )
}

function buildPositions(players: PreviewLineupPlayer[], side: 'home' | 'away'): Array<{
  player: PreviewLineupPlayer
  cx: number
  cy: number
}> {
  const parsed = players.map((p) => ({ player: p, grid: parseGrid(p.grid) }))
  const withGrid = parsed.filter((p) => p.grid !== null)

  // Home ocupa a metade esquerda, away a metade direita. Goleiro sempre na borda externa.
  // grid.row 1 = goleiro; aumenta em direção ao ataque.
  if (withGrid.length === 0) {
    // fallback: distribui em linha
    const step = PLAYER_Y_RANGE / (players.length + 1)
    return players.map((p, idx) => ({
      player: p,
      cx: side === 'home' ? 10 + idx * 4 : PITCH_WIDTH - 10 - idx * 4,
      cy: PLAYER_MIN_Y + step * (idx + 1),
    }))
  }

  // Para cada linha (row), distribuir as colunas verticalmente.
  const rowMap = new Map<number, Array<{ player: PreviewLineupPlayer; col: number }>>()
  for (const { player, grid } of withGrid) {
    if (!grid) continue
    const arr = rowMap.get(grid.row) ?? []
    arr.push({ player, col: grid.col })
    rowMap.set(grid.row, arr)
  }
  const rows = [...rowMap.keys()].sort((a, b) => a - b)
  const maxRow = rows[rows.length - 1] ?? 1

  const positions: Array<{ player: PreviewLineupPlayer; cx: number; cy: number }> = []
  for (const row of rows) {
    const cols = rowMap.get(row)!.sort((a, b) => a.col - b.col)
    cols.forEach((entry, idx) => {
      // row 1 (goleiro) fica na borda; rows altos vão pro centro.
      const xRatio = (row - 1) / Math.max(1, maxRow - 1)
      const cx = side === 'home' ? 8 + xRatio * 40 : PITCH_WIDTH - 8 - xRatio * 40
      const cy = PLAYER_MIN_Y + (idx + 1) * (PLAYER_Y_RANGE / (cols.length + 1))
      positions.push({ player: entry.player, cx, cy })
    })
  }
  return positions
}

function PitchSVG({ lineups }: { lineups: PreviewLineup[] }) {
  const home = lineups[0]
  const away = lineups[1]

  const homeColor = ensureColor(home?.team.colors?.player.primary, '#123D2A')
  const awayColor = ensureColor(away?.team.colors?.player.primary, '#D8A900')
  const homeText = ensureColor(home?.team.colors?.player.number, '#FFFFFF')
  const awayText = ensureColor(away?.team.colors?.player.number, '#FFFFFF')
  const homeStroke = ensureColor(home?.team.colors?.player.border, '#FFFFFF')
  const awayStroke = ensureColor(away?.team.colors?.player.border, '#FFFFFF')

  const homePositions = home ? buildPositions(home.startXI, 'home') : []
  const awayPositions = away ? buildPositions(away.startXI, 'away') : []

  return (
    <svg
      viewBox={`0 0 ${PITCH_WIDTH} ${PITCH_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className="aspect-[14/9] w-full rounded-[var(--radius-md)]"
      style={{ background: 'color-mix(in srgb, var(--brand) 18%, var(--surface-soft))' }}
      role="img"
      aria-label="Campo com escalações"
    >
      {/* Linhas do campo */}
      <rect x="2" y="2" width="108" height="68" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />
      <line x1="56" y1="2" x2="56" y2="70" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />
      <circle cx="56" cy="36" r="9" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />
      <rect x="2" y="21" width="16" height="30" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />
      <rect x="94" y="21" width="16" height="30" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />
      <rect x="2" y="29" width="7" height="14" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />
      <rect x="103" y="29" width="7" height="14" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />

      {homePositions.map(({ player, cx, cy }, idx) => (
        <PlayerDot
          key={`h-${player.id ?? idx}`}
          player={player}
          cx={cx}
          cy={cy}
          fill={homeColor}
          stroke={homeStroke}
          textColor={homeText}
        />
      ))}
      {awayPositions.map(({ player, cx, cy }, idx) => (
        <PlayerDot
          key={`a-${player.id ?? idx}`}
          player={player}
          cx={cx}
          cy={cy}
          fill={awayColor}
          stroke={awayStroke}
          textColor={awayText}
        />
      ))}
    </svg>
  )
}

function BenchList({ lineup, color }: { lineup: PreviewLineup; color: string }) {
  if (lineup.substitutes.length === 0) return null

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        Reservas · {lineup.team.name}
      </p>
      <ul className="space-y-1">
        {lineup.substitutes.map((s, idx) => (
          <li
            key={s.id ?? `${lineup.team.id}-${idx}`}
            className="flex items-center gap-2 text-xs text-[var(--text)]"
          >
            <span
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: color }}
            >
              {s.number ?? '-'}
            </span>
            <span className="truncate">{s.name}</span>
            {s.pos ? (
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {s.pos}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CoachInfo({ lineup }: { lineup: PreviewLineup }) {
  const [hasImageError, setHasImageError] = useState(false)

  if (!lineup.coach.name) return null
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
      {lineup.coach.photo && !hasImageError ? (
        <img
          src={lineup.coach.photo}
          alt={lineup.coach.name}
          loading="lazy"
          className="h-7 w-7 rounded-full object-cover"
          onError={() => setHasImageError(true)}
        />
      ) : lineup.coach.photo ? (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--text)]">
          <User size={14} aria-hidden="true" />
        </span>
      ) : (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[10px] font-bold text-[var(--text)]">
          {lineup.coach.name.charAt(0)}
        </span>
      )}
      <span className="truncate">
        <span className="font-semibold text-[var(--text)]">Téc.</span> {lineup.coach.name}
      </span>
    </div>
  )
}

export function PreMatchLineup({
  lineups,
  headerLabel = 'Escalação provável',
  emptyMessage = 'As escalações são publicadas pela federação cerca de 30–60 minutos antes do apito inicial.',
}: PreMatchLineupProps) {
  const [view, setView] = useState<'pitch' | 'list'>('pitch')
  const [showSubstitutes, setShowSubstitutes] = useState(false)

  if (lineups.length === 0) {
    return (
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {headerLabel}
        </p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">{emptyMessage}</p>
      </section>
    )
  }

  const home = lineups[0]
  const away = lineups[1]
  const homeColor = ensureColor(home?.team.colors?.player.primary, '#123D2A')
  const awayColor = ensureColor(away?.team.colors?.player.primary, '#D8A900')
  const hasAnySubstitutes = (home?.substitutes.length ?? 0) > 0 || (away?.substitutes.length ?? 0) > 0

  return (
    <section className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {headerLabel}
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">
            {home?.formation ?? '—'} <span className="text-[var(--text-muted)]">×</span> {away?.formation ?? '—'}
          </h3>
        </div>
        <div
          role="tablist"
          aria-label="Visualização da escalação"
          className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-soft)] p-0.5 text-[10px] font-semibold"
        >
          {(['pitch', 'list'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              role="tab"
              aria-selected={view === opt}
              onClick={() => setView(opt)}
              className={`rounded-full px-2.5 py-1 transition ${
                view === opt
                  ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {opt === 'pitch' ? 'Campo' : 'Lista'}
            </button>
          ))}
        </div>
      </header>

      {view === 'pitch' ? (
        <>
          <PitchSVG lineups={lineups} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-xs text-[var(--text)]">
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 rounded-full border border-[var(--border)]"
                style={{ background: homeColor }}
              />
              <span className="truncate font-semibold">{home?.team.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text)] sm:justify-end">
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 rounded-full border border-[var(--border)]"
                style={{ background: awayColor }}
              />
              <span className="truncate font-semibold">{away?.team.name}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {home ? (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Titulares · {home.team.name}
              </p>
              <ul className="space-y-1">
                {home.startXI.map((p, idx) => (
                  <li
                    key={p.id ?? `h-${idx}`}
                    className="flex items-center gap-2 text-xs text-[var(--text)]"
                  >
                    <span
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: homeColor }}
                    >
                      {p.number ?? '-'}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {away ? (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Titulares · {away.team.name}
              </p>
              <ul className="space-y-1">
                {away.startXI.map((p, idx) => (
                  <li
                    key={p.id ?? `a-${idx}`}
                    className="flex items-center gap-2 text-xs text-[var(--text)]"
                  >
                    <span
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: awayColor }}
                    >
                      {p.number ?? '-'}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      <div className="grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
        {home ? (
          <div className="space-y-3">
            <CoachInfo lineup={home} />
          </div>
        ) : null}
        {away ? (
          <div className="space-y-3">
            <CoachInfo lineup={away} />
          </div>
        ) : null}
      </div>
      {hasAnySubstitutes ? (
        <div className="space-y-3 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            aria-expanded={showSubstitutes}
            aria-controls="lineup-substitutes"
            onClick={() => setShowSubstitutes((curr) => !curr)}
            className="text-[11px] font-medium text-[var(--text-muted)] underline underline-offset-2 transition hover:text-[var(--text)]"
          >
            {showSubstitutes ? 'Ocultar reservas' : 'Mostrar reservas'}
          </button>
          {showSubstitutes ? (
            <div id="lineup-substitutes" className="grid gap-3 sm:grid-cols-2">
              {home ? <BenchList lineup={home} color={homeColor} /> : null}
              {away ? <BenchList lineup={away} color={awayColor} /> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
