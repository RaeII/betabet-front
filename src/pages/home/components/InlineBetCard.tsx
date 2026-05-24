import { useState } from 'react'
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

function FlagOrInitial({ name, flagUrl }: { name: string; flagUrl: string }) {
  if (flagUrl) {
    return (
      <img
        src={flagUrl}
        alt={name}
        className="h-8 w-8 rounded-full border border-[var(--border)] object-cover"
      />
    )
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-soft)] text-xs font-bold text-[var(--brand)]">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export function InlineBetCard({ match, groupId }: InlineBetCardProps) {
  const placeBet = usePlaceBet()
  const editBet = useEditBet(match.id)
  const isEditing = match.userBet !== null
  const [home, setHome] = useState<string>(
    match.userBet ? String(match.userBet.homeScore) : '',
  )
  const [away, setAway] = useState<string>(
    match.userBet ? String(match.userBet.awayScore) : '',
  )
  const locked = !isBetEditable(match.scheduledAt) || match.status === 'finished'

  const homeEmpty = home === ''
  const awayEmpty = away === ''
  const isPending = placeBet.isPending || editBet.isPending

  function handleSave() {
    const h = clampScore(Number(home))
    const a = clampScore(Number(away))
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
    <article className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{formatMatchDate(match.scheduledAt)}</span>
        <span>{match.stadium.name}</span>
      </header>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FlagOrInitial name={match.homeTeam.name} flagUrl={match.homeTeam.flagUrl} />
          <span className="truncate text-sm font-semibold text-[var(--text)]">
            {match.homeTeam.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            aria-label={`Palpite ${match.homeTeam.name}`}
            value={home}
            onChange={e => setHome(e.target.value)}
            disabled={locked || isPending}
            className="h-12 w-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-center text-lg font-bold text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)] disabled:opacity-60"
          />
          <span className="text-base font-bold text-[var(--text-muted)]">×</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            aria-label={`Palpite ${match.awayTeam.name}`}
            value={away}
            onChange={e => setAway(e.target.value)}
            disabled={locked || isPending}
            className="h-12 w-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-center text-lg font-bold text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)] disabled:opacity-60"
          />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-semibold text-[var(--text)]">
            {match.awayTeam.name}
          </span>
          <FlagOrInitial name={match.awayTeam.name} flagUrl={match.awayTeam.flagUrl} />
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2">
        {isEditing && !placeBet.isError && !editBet.isError ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--success)]">
            <CheckCircle2 size={12} />
            Palpite salvo
          </span>
        ) : <span />}

        {locked ? (
          <span className="text-xs text-[var(--text-muted)]">Apostas encerradas</span>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={homeEmpty || awayEmpty || isPending}
          >
            {isPending ? 'Salvando…' : isEditing ? 'Atualizar' : 'Salvar palpite'}
          </Button>
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
