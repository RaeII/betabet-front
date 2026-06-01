import { useMemo, useState } from 'react'
import { Crown, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'
import { useChampionBet } from '@/hooks/useChampionBet'
import { useTeams } from '@/hooks/useTeams'
import { formatMatchDate } from '@/lib/date.utils'
import { ChampionBetModal } from './ChampionBetModal'
import type { Team } from '@/types/match.types'

interface ChampionBetCardProps {
  groupId: string
}

function PickRow({ rank, team, points, hit }: { rank: 1 | 2; team: Team | null; points: number; hit: boolean | null }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--surface-soft)] px-3 py-2.5">
      <span className="shrink-0 text-xs font-bold text-[var(--text-muted)]">{rank}º</span>
      <TeamFlagImage
        src={team?.flagUrl}
        teamId={team?.id}
        alt={team?.name ?? ''}
        className="h-5 w-7 shrink-0 rounded object-contain"
      />
      <span className="truncate text-sm font-semibold text-[var(--text)]">
        {team?.name ?? 'Seleção'}
      </span>
      <span
        className={`ml-auto shrink-0 text-xs font-bold ${
          hit ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'
        }`}
      >
        {hit === null ? `vale ${points} pts` : hit ? `+${points} pts` : `${points} pts`}
      </span>
    </div>
  )
}

export function ChampionBetCard({ groupId }: ChampionBetCardProps) {
  const { data: state, isLoading } = useChampionBet(groupId)
  const [modalOpen, setModalOpen] = useState(false)

  const hasBet = !!state?.myBet
  const settled = !!state?.championTeamId
  const needsTeams = !!state?.enabled && (hasBet || settled)
  const { data: teamsData } = useTeams(needsTeams)
  const teams = teamsData?.teams ?? []

  const firstTeam = useMemo(
    () => teams.find(t => t.id === state?.myBet?.firstTeamId) ?? null,
    [teams, state?.myBet?.firstTeamId],
  )
  const secondTeam = useMemo(
    () => teams.find(t => t.id === state?.myBet?.secondTeamId) ?? null,
    [teams, state?.myBet?.secondTeamId],
  )

  if (isLoading || !state || !state.enabled) return null

  const { bettingOpen, deadline, firstPoints, secondPoints, championTeamId, myBet } = state
  const firstHit = settled && myBet ? championTeamId === myBet.firstTeamId : null
  const secondHit = settled && myBet ? championTeamId === myBet.secondTeamId : null
  const earnedPoints = myBet?.points ?? 0

  return (
    <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="flex items-center gap-2">
        <Crown size={18} className="text-[var(--brand)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Campeão da Copa</h3>
        {hasBet && bettingOpen && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)] transition hover:opacity-80"
          >
            <Pencil size={13} />
            Trocar
          </button>
        )}
      </header>

      {hasBet ? (
        <div className="space-y-2">
          <PickRow rank={1} team={firstTeam} points={firstPoints} hit={firstHit} />
          <PickRow rank={2} team={secondTeam} points={secondPoints} hit={secondHit} />

          {settled ? (
            <p className={`text-sm font-medium ${earnedPoints > 0 ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'}`}>
              {earnedPoints > 0
                ? `Você acertou e ganhou ${earnedPoints} pontos! 🏆`
                : 'Não foi dessa vez — seu palpite não pontuou.'}
            </p>
          ) : bettingOpen ? (
            <p className="text-xs text-[var(--text-muted)]">
              {deadline
                ? `Você pode trocar até ${formatMatchDate(deadline)}.`
                : 'Você pode trocar até o início da Copa.'}
            </p>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">
              Apostas encerradas — aguardando a definição do campeão.
            </p>
          )}
        </div>
      ) : bettingOpen ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-muted)]">
            Você ainda não escolheu o campeão. Selecione duas seleções —
            {' '}{firstPoints} pts se a 1ª for campeã, {secondPoints} pts se for a 2ª.
            {deadline ? ` Escolha até ${formatMatchDate(deadline)}.` : ''}
          </p>
          <Button onClick={() => setModalOpen(true)} className="w-full sm:w-auto">
            <Crown size={16} />
            Escolher campeão
          </Button>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          As apostas de campeão estão encerradas.
        </p>
      )}

      <ChampionBetModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        groupId={groupId}
        firstPoints={firstPoints}
        secondPoints={secondPoints}
        initialFirstId={myBet?.firstTeamId ?? null}
        initialSecondId={myBet?.secondTeamId ?? null}
      />
    </section>
  )
}
