import { useEffect, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditBet, usePlaceBet } from '@/hooks/useBets'
import { formatMatchDate, isBetEditable } from '@/lib/date.utils'
import type { MatchWithUserBet } from '@/types/match.types'

interface InlineBetCardProps {
  match: MatchWithUserBet
  groupId: string
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(20, Math.floor(value)))
}

const scoreInputClassName =
  'h-12 w-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-center text-lg font-bold tabular-nums text-[var(--text)] caret-[var(--text)] transition duration-150 focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand)_10%,transparent)] disabled:opacity-60'

function FlagOrInitial({ name, flagUrl }: { name: string; flagUrl: string }) {
  if (flagUrl) {
    return (
      <img
        src={flagUrl}
        alt={name}
        className="h-11 w-14 object-contain sm:h-12 sm:w-16"
      />
    )
  }
  return (
    <span className="flex h-11 w-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-soft)] text-sm font-bold text-[var(--brand)] sm:h-12 sm:w-16">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

function TeamIdentity({ name, flagUrl }: { name: string; flagUrl: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <FlagOrInitial name={name} flagUrl={flagUrl} />
      <span className="max-w-full truncate text-xs font-semibold leading-4 text-[var(--text)] sm:text-[13px]">
        {name}
      </span>
    </div>
  )
}

export function InlineBetCard({ match, groupId }: InlineBetCardProps) {
  const placeBet = usePlaceBet()
  const editBet = useEditBet(match.id)
  const isEditing = match.userBet !== null
  const hideSavedIconTimeout = useRef<number | null>(null)
  const savedHome = match.userBet ? String(match.userBet.homeScore) : ''
  const savedAway = match.userBet ? String(match.userBet.awayScore) : ''
  const [home, setHome] = useState<string>(savedHome)
  const [away, setAway] = useState<string>(savedAway)
  const [showSavedIcon, setShowSavedIcon] = useState(false)
  const locked = !isBetEditable(match.scheduledAt) || match.status === 'finished'

  const homeEmpty = home === ''
  const awayEmpty = away === ''
  const isPending = placeBet.isPending || editBet.isPending
  const hasScoreChanged = home !== savedHome || away !== savedAway
  const showAction = !locked && !homeEmpty && !awayEmpty && (hasScoreChanged || isPending)

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

    if (isEditing && match.userBet) {
      editBet.mutate({
        betId: match.userBet.id,
        homeScore: h,
        awayScore: a,
        matchId: match.id,
        groupId,
      })
    } else {
      placeBet.mutate({
        matchId: match.id,
        groupId,
        homeScore: h,
        awayScore: a,
        replicateToAllGroups: false,
      })
    }
  }

  return (
    <article className="mx-auto w-full max-w-[42rem] space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <header className="flex items-center justify-between gap-3 text-xs font-medium text-[var(--text-muted)]">
        <span className="shrink-0">{formatMatchDate(match.scheduledAt).split(",").join(" ")}</span>
        <span className="min-w-0 truncate text-right">{match.stadium.name}</span>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center justify-items-center gap-3 sm:gap-5">
        <TeamIdentity name={match.homeTeam.name} flagUrl={match.homeTeam.flagUrl} />

        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            aria-label={`Palpite ${match.homeTeam.name}`}
            value={home}
            onChange={e => handleHomeChange(e.target.value)}
            disabled={locked || isPending}
            className={scoreInputClassName}
          />
          <span className="text-sm font-bold text-[var(--text-muted)] sm:text-base">×</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            aria-label={`Palpite ${match.awayTeam.name}`}
            value={away}
            onChange={e => handleAwayChange(e.target.value)}
            disabled={locked || isPending}
            className={scoreInputClassName}
          />
        </div>

        <TeamIdentity name={match.awayTeam.name} flagUrl={match.awayTeam.flagUrl} />
      </div>

      <footer className="relative flex min-h-9 items-center justify-center">
        {locked ? (
          <span className="text-xs text-[var(--text-muted)]">Apostas encerradas</span>
        ) : (
          <div className="relative flex min-h-9 w-36 items-center justify-center">
            <span
              role="status"
              aria-label="Palpite salvo"
              aria-hidden={!showSavedIcon}
              className={`absolute inset-0 flex items-center justify-center text-[var(--success)] transition duration-300 ${
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
              className={`w-full transition duration-200 ${
                showAction
                  ? 'translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-1 opacity-0'
              }`}
            >
              {isPending ? 'Salvando…' : isEditing ? 'Atualizar' : 'Salvar palpite'}
            </Button>
          </div>
        )}
      </footer>

      {(placeBet.isError || editBet.isError) ? (
        <p role="alert" className="text-xs text-[var(--danger)]">
          Não foi possível salvar. Tente novamente.
        </p>
      ) : null}
    </article>
  )
}
