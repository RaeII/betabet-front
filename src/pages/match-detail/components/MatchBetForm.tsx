import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Minus, Plus } from 'lucide-react'
import { MatchTeamIdentity } from '@/components/match/MatchTeamIdentity'
import { Button } from '@/components/ui/button'
import { useEditBet, usePlaceBet } from '@/hooks/useBets'
import {
  formatCountdownMmSs,
  formatMatchDate,
  formatTimeOnly,
  isMatchToday,
  isMatchTomorrow,
  secondsUntilKickoff,
} from '@/lib/date.utils'
import type { MatchWithUserBet } from '@/types/match.types'

interface MatchBetFormProps {
  match: MatchWithUserBet
  groupId: string
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(20, Math.floor(value)))
}

const scoreInputClassName =
  'h-12 w-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-0 text-center text-lg font-bold tabular-nums text-[var(--text)] caret-[var(--text)] transition duration-150 placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand)_10%,transparent)] disabled:opacity-60 sm:h-[3.25rem] sm:w-[3.25rem]'

const scoreButtonClassName =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)] transition duration-150 hover:border-[var(--brand)] hover:bg-[var(--surface)] hover:text-[var(--brand)] active:scale-95 disabled:pointer-events-none disabled:opacity-30'

function getSteppedScore(value: string, direction: -1 | 1): string {
  // Sem palpite ainda: o primeiro clique para no 0 (em vez de pular pro 1).
  if (value === '') return '0'
  return String(clampScore(clampScore(Number(value)) + direction))
}

interface ScoreInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

function ScoreInput({ label, value, onChange, disabled }: ScoreInputProps) {
  function handleInputChange(nextValue: string) {
    const digits = nextValue.replace(/\D/g, '').slice(0, 2)
    onChange(digits === '' ? '' : String(clampScore(Number(digits))))
  }

  function handleStep(direction: -1 | 1) {
    onChange(getSteppedScore(value, direction))
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Diminuir ${label.toLowerCase()}`}
        onClick={() => handleStep(-1)}
        disabled={disabled}
        className={scoreButtonClassName}
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        aria-label={label}
        placeholder="-"
        value={value}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={e => e.currentTarget.select()}
        onClick={e => e.currentTarget.select()}
        onBlur={e => {
          if (e.target.value !== '') onChange(String(clampScore(Number(e.target.value))))
        }}
        disabled={disabled}
        className={scoreInputClassName}
      />

      <button
        type="button"
        aria-label={`Aumentar ${label.toLowerCase()}`}
        onClick={() => handleStep(1)}
        disabled={disabled}
        className={scoreButtonClassName}
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  )
}

export function MatchBetForm({ match, groupId }: MatchBetFormProps) {
  const placeBet = usePlaceBet()
  const editBet = useEditBet(match.id)
  const isEditing = match.userBet !== null
  const hideSavedIconTimeout = useRef<number | null>(null)
  const savedHome = match.userBet ? String(match.userBet.homeScore) : ''
  const savedAway = match.userBet ? String(match.userBet.awayScore) : ''
  // Toggle persistido por grupo: reflete o palpite existente; default ligado.
  const savedReplicate = match.userBet ? match.userBet.replicate : true
  const [home, setHome] = useState<string>(savedHome)
  const [away, setAway] = useState<string>(savedAway)
  const [replicate, setReplicate] = useState(savedReplicate)
  const [showSavedIcon, setShowSavedIcon] = useState(false)
  const [secsRemaining, setSecsRemaining] = useState(() => secondsUntilKickoff(match.scheduledAt))

  const isPending = placeBet.isPending || editBet.isPending
  const homeEmpty = home === ''
  const awayEmpty = away === ''
  const hasScoreChanged = home !== savedHome || away !== savedAway
  const showAction = !homeEmpty && !awayEmpty && (hasScoreChanged || isPending)
  const isCountdown = secsRemaining > 0 && secsRemaining <= 30 * 60

  useEffect(() => {
    if (secsRemaining > 30 * 60) return
    const id = setInterval(() => {
      setSecsRemaining(secondsUntilKickoff(match.scheduledAt))
    }, 1000)
    return () => clearInterval(id)
  }, [match.scheduledAt, secsRemaining > 30 * 60])

  useEffect(() => {
    setHome(savedHome)
    setAway(savedAway)
    setReplicate(savedReplicate)
    setShowSavedIcon(false)
  }, [groupId, match.id, savedHome, savedAway, savedReplicate])

  useEffect(() => {
    if (!placeBet.isSuccess && !editBet.isSuccess) return

    setShowSavedIcon(true)

    if (hideSavedIconTimeout.current !== null) {
      window.clearTimeout(hideSavedIconTimeout.current)
    }

    hideSavedIconTimeout.current = window.setTimeout(() => {
      setShowSavedIcon(false)
      hideSavedIconTimeout.current = null
    }, 1400)

    return () => {
      if (hideSavedIconTimeout.current !== null) {
        window.clearTimeout(hideSavedIconTimeout.current)
        hideSavedIconTimeout.current = null
      }
    }
  }, [placeBet.isSuccess, editBet.isSuccess])

  const timeLabel = (() => {
    if (secsRemaining > 0 && secsRemaining <= 30 * 60) {
      return formatCountdownMmSs(secsRemaining)
    }
    if (isMatchToday(match.scheduledAt)) return `Hoje, ${formatTimeOnly(match.scheduledAt)}`
    if (isMatchTomorrow(match.scheduledAt)) return `Amanhã, ${formatTimeOnly(match.scheduledAt)}`
    return formatMatchDate(match.scheduledAt).split(',').join(' ')
  })()

  function handleHomeChange(value: string) {
    setShowSavedIcon(false)
    setHome(value)
  }

  function handleAwayChange(value: string) {
    setShowSavedIcon(false)
    setAway(value)
  }

  function handleSave() {
    const h = clampScore(Number(home))
    const a = clampScore(Number(away))
    setShowSavedIcon(false)
    setHome(String(h))
    setAway(String(a))

    // `replicate` (toggle) é persistido por grupo. Quando ligado, o backend
    // propaga o placar para os demais grupos, exceto os que estão em opt-out.
    if (isEditing && match.userBet) {
      editBet.mutate({
        betId: match.userBet.id,
        homeScore: h,
        awayScore: a,
        replicate,
        matchId: match.id,
        groupId,
      })
    } else {
      placeBet.mutate({
        matchId: match.id,
        groupId,
        homeScore: h,
        awayScore: a,
        replicateToAllGroups: replicate,
      })
    }
  }

  return (
    <article className="mx-auto w-full max-w-[42rem] space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <header className="flex items-center justify-between gap-3 text-xs font-medium text-[var(--text-muted)]">
        <span className={`shrink-0 tabular-nums ${isCountdown ? 'font-semibold text-[var(--brand)]' : ''}`}>
          {timeLabel}
        </span>
        <span className="min-w-0 truncate text-right">{match.stadium.name}</span>
      </header>

      <div className="grid grid-cols-2 items-start justify-items-center gap-x-4 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-5">
        <div className="min-w-0">
          <MatchTeamIdentity
            name={match.homeTeam.name}
            flagUrl={match.homeTeam.flagUrl}
            teamId={match.homeTeam.id}
          />
        </div>

        <div className="order-last col-span-2 flex items-center gap-2 sm:order-none sm:col-span-1">
          <ScoreInput
            label={`Palpite ${match.homeTeam.name}`}
            value={home}
            onChange={handleHomeChange}
            disabled={isPending}
          />
          <span className="text-sm font-bold text-[var(--text-muted)] sm:text-base">×</span>
          <ScoreInput
            label={`Palpite ${match.awayTeam.name}`}
            value={away}
            onChange={handleAwayChange}
            disabled={isPending}
          />
        </div>

        <div className="min-w-0">
          <MatchTeamIdentity
            name={match.awayTeam.name}
            flagUrl={match.awayTeam.flagUrl}
            teamId={match.awayTeam.id}
          />
        </div>
      </div>

      <footer className="flex min-h-9 items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            role="switch"
            aria-checked={replicate}
            aria-label="Replicar palpite para todos os bolões"
            onClick={() => setReplicate(v => !v)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
              replicate
                ? 'bg-[var(--brand)]'
                : 'border border-[var(--border)] bg-[var(--surface-soft)]'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                replicate ? 'translate-x-[1.125rem]' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className="max-w-[8rem] text-[10px] leading-tight text-[var(--text-muted)]">
            {replicate ? 'Replicando para todos os bolões' : 'Somente este bolão'}
          </span>
        </div>

        <div className="relative flex min-h-9 w-36 items-center justify-end">
          <span
            role="status"
            aria-label="Palpite salvo"
            aria-hidden={!showSavedIcon}
            className={`pointer-events-none absolute inset-0 flex items-center justify-end text-[var(--success)] transition duration-300 ${
              showSavedIcon ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
            }`}
          >
            <CheckCircle2 size={20} />
          </span>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            aria-hidden={!showAction}
            tabIndex={showAction ? undefined : -1}
            className={`transition duration-200 ${
              showAction && !showSavedIcon
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-1 opacity-0'
            }`}
          >
            {isPending ? 'Salvando…' : isEditing ? 'Atualizar' : 'Salvar palpite'}
          </Button>
        </div>
      </footer>

      {(placeBet.isError || editBet.isError) ? (
        <p role="alert" className="text-center text-xs text-[var(--danger)]">
          Não foi possível salvar. Tente novamente.
        </p>
      ) : null}
    </article>
  )
}
