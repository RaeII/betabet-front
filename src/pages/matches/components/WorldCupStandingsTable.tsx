import { TeamFlagImage } from '@/components/match/TeamFlagImage'
import type { WorldCupStanding } from '@/types/worldCup.types'
import {
  type GroupTeamAsset,
  teamAssetApiIdKey,
  teamAssetNameKey,
} from './worldCupGroup.utils'

interface WorldCupStandingsTableProps {
  rows: WorldCupStanding[]
  isLoading: boolean
  isError: boolean
  teamAssets?: Map<string, GroupTeamAsset>
}

function StandingLogo({
  row,
  teamAssets,
}: {
  row: WorldCupStanding
  teamAssets?: Map<string, GroupTeamAsset>
}) {
  const teamAsset =
    teamAssets?.get(teamAssetApiIdKey(row.team.id)) ??
    teamAssets?.get(teamAssetNameKey(row.team.name))
  const src = teamAsset?.flagUrl || row.team.logo
  const teamId = teamAsset?.teamId ?? row.team.id

  if (!src) {
    return (
      <span className="flex h-7 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-soft)] text-xs font-bold text-[var(--text-muted)]">
        {row.team.name.charAt(0)}
      </span>
    )
  }

  return (
    <TeamFlagImage
      src={src}
      teamId={teamId}
      alt=""
      className="h-7 w-10 rounded-[var(--radius-md)] object-contain"
    />
  )
}

export function WorldCupStandingsTable({
  rows,
  isLoading,
  isError,
  teamAssets,
}: WorldCupStandingsTableProps) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]">
      {isLoading ? (
        <div className="flex h-44 items-center justify-center text-sm text-[var(--text-muted)]">
          Carregando classificação...
        </div>
      ) : isError ? (
        <div className="flex h-44 items-center justify-center px-4 text-center text-sm text-[var(--danger)]">
          Não foi possível carregar a classificação oficial.
        </div>
      ) : rows.length === 0 ? (
        <div className="flex h-44 items-center justify-center px-4 text-center text-sm text-[var(--text-muted)]">
          Classificação ainda indisponível para este grupo.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[38rem] text-left text-sm">
            <thead className="bg-[var(--surface-soft)] text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              <tr>
                <th className="w-14 px-4 py-3">Pos</th>
                <th className="px-3 py-3">Seleção</th>
                <th className="px-3 py-3 text-center">Pts</th>
                <th className="px-3 py-3 text-center">J</th>
                <th className="px-3 py-3 text-center">V</th>
                <th className="px-3 py-3 text-center">E</th>
                <th className="px-3 py-3 text-center">D</th>
                <th className="px-3 py-3 text-center">SG</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map(row => (
                <tr key={row.team.id} className="text-[var(--text)]">
                  <td className="px-4 py-3 font-bold tabular-nums">{row.rank}</td>
                  <td className="px-3 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <StandingLogo row={row} teamAssets={teamAssets} />
                      <span className="truncate font-semibold">{row.team.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center font-bold tabular-nums">{row.points}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{row.all.played}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{row.all.win}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{row.all.draw}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{row.all.lose}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{row.goalsDiff}</td>
                  <td className="px-4 py-3 text-center">
                    {row.description ? (
                      <span
                        className="inline-flex rounded-[var(--radius-pill)] bg-[var(--surface-soft)] px-2 py-1 text-xs font-semibold text-[var(--brand)]"
                        title={row.description}
                      >
                        Classifica
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
