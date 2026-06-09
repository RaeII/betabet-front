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

function PickChip({ rank, team, points, hit }: { rank: 1 | 2; team: Team | null; points: number; hit: boolean | null }) {
  const label = rank === 1 ? 'Opção 1' : 'Opção 2'

  return (
    <div className="min-w-0 space-y-1">
      <span className="block px-1 text-[11px] font-bold leading-none text-[var(--text-muted)]">{label}</span>
      <div className="flex min-w-0 items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--surface-soft)] px-2.5 py-2">
        <TeamFlagImage
          src={team?.flagUrl}
          teamId={team?.id}
          alt={team?.name ?? ''}
          className="h-5 w-7 shrink-0 rounded object-contain"
        />
        <span className="min-w-0 truncate text-sm font-semibold text-[var(--text)]">
          {team?.name ?? 'Seleção'}
        </span>
        <span
          className={`ml-auto shrink-0 text-[11px] font-bold ${
            hit ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'
          }`}
        >
          {hit === null ? `${points} pts` : hit ? `+${points}` : `${points}`}
        </span>
      </div>
    </div>
  )
}

/** Frase com os dois prazos: 1º palpite (fim da 1ª rodada) e 2º (fim dos grupos). */
function DeadlineNote({
  firstOpen,
  firstDeadline,
  secondDeadline,
}: {
  firstOpen: boolean
  firstDeadline: string | null
  secondDeadline: string | null
}) {
  if (!firstDeadline && !secondDeadline) {
    return <>Você pode trocar até o início da Copa.</>
  }
  const opcao1 = !firstOpen
    ? 'travada'
    : firstDeadline
      ? `até ${formatMatchDate(firstDeadline)}`
      : 'em aberto'
  const opcao2 = secondDeadline ? `até ${formatMatchDate(secondDeadline)}` : 'em aberto'
  return (
    <>
      Opção 1 (fim da 1ª rodada) {opcao1} · opção 2 (fim da fase de grupos) {opcao2}.
    </>
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

  const { bettingOpen, firstOpen, firstDeadline, secondDeadline, firstPoints, secondPoints, championTeamId, myBet } =
    state
  // Apostar de novo exige o 1º palpite em aberto; trocar uma aposta existente
  // basta o 2º (bettingOpen). Sem 1º palpite, um novato não consegue apostar.
  const canCreate = !hasBet && firstOpen
  const firstHit = settled && myBet ? championTeamId === myBet.firstTeamId : null
  const secondHit = settled && myBet ? championTeamId === myBet.secondTeamId : null
  const earnedPoints = myBet?.points ?? 0

  return (
    <section className="mx-auto w-full max-w-[34rem] space-y-2.5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-3.5">
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
          <div className="grid grid-cols-2 gap-2">
            <PickChip rank={1} team={firstTeam} points={firstPoints} hit={firstHit} />
            <PickChip rank={2} team={secondTeam} points={secondPoints} hit={secondHit} />
          </div>

          {settled ? (
            <p className={`text-xs font-medium ${earnedPoints > 0 ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'}`}>
              {earnedPoints > 0
                ? `Você ganhou ${earnedPoints} pontos.`
                : 'Seu palpite não pontuou.'}
            </p>
          ) : bettingOpen ? (
            <p className="text-xs text-[var(--text-muted)]">
              <DeadlineNote
                firstOpen={firstOpen}
                firstDeadline={firstDeadline}
                secondDeadline={secondDeadline}
              />
            </p>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">
              Apostas encerradas — aguardando a definição do campeão.
            </p>
          )}
        </div>
      ) : canCreate ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 rounded-[var(--radius-lg)] bg-[var(--surface-soft)] px-3 py-2.5">
            <p className="text-sm leading-5 text-[var(--text-muted)]">
              <span className="block font-semibold text-[var(--text)]">Escolha 2 opções de campeão:</span>
              <span className="mt-1 block">
                opção 1 vale {firstPoints} pts, opção 2 vale {secondPoints} pts.
              </span>
              <span className="mt-2 block border-t border-[var(--border)] pt-2 text-xs font-medium">
                <DeadlineNote
                  firstOpen={firstOpen}
                  firstDeadline={firstDeadline}
                  secondDeadline={secondDeadline}
                />
              </span>
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} size="sm" className="w-full shrink-0 sm:w-auto sm:self-center">
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
        firstOpen={firstOpen}
        firstPoints={firstPoints}
        secondPoints={secondPoints}
        initialFirstId={myBet?.firstTeamId ?? null}
        initialSecondId={myBet?.secondTeamId ?? null}
      />
    </section>
  )
}
