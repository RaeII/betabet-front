import type { MatchesResponse } from '@/types/match.types'
import type { WorldCupStanding, WorldCupStandingsResponse } from '@/types/worldCup.types'
import {
  getGroupTeamAssets,
  normalizeGroupLetter,
  teamAssetApiIdKey,
  teamAssetNameKey,
  type GroupTeamAsset,
} from './worldCupGroup.utils'
import type { SlotRef } from './knockoutBracket.config'

export interface ResolvedTeam {
  name: string
  flagUrl: string
  teamId: string | number | null
}

/** Slot resolvido para um time concreto (1º/2º já definidos pela classificação). */
export interface TeamSlotView {
  type: 'team'
  team: ResolvedTeam
  seed: string
}

/** Slot ainda em aberto (melhor 3º ou vencedor de outro jogo). */
export interface LabelSlotView {
  type: 'label'
  primary: string
  secondary?: string
}

export type SlotView = TeamSlotView | LabelSlotView

export interface StandingsIndex {
  /** Letra do grupo (A–L) → linhas ordenadas por colocação. */
  byGroup: Map<string, WorldCupStanding[]>
}

export function buildStandingsIndex(res: WorldCupStandingsResponse | undefined): StandingsIndex {
  const byGroup = new Map<string, WorldCupStanding[]>()
  for (const rows of res?.data.league.standings ?? []) {
    const letter = normalizeGroupLetter(rows.find(row => row.group)?.group)
    // Ignora a pseudo-tabela "Group Stage" (ranking dos 3ºs), sem letra de grupo.
    if (letter) byGroup.set(letter, [...rows].sort((a, b) => a.rank - b.rank))
  }
  return { byGroup }
}

function resolveStandingTeam(
  standing: WorldCupStanding | undefined,
  teamAssets: Map<string, GroupTeamAsset>,
): ResolvedTeam | null {
  if (!standing) return null
  const asset =
    teamAssets.get(teamAssetApiIdKey(standing.team.id)) ??
    teamAssets.get(teamAssetNameKey(standing.team.name))
  return {
    name: asset?.name ?? standing.team.name,
    flagUrl: asset?.flagUrl || standing.team.logo,
    teamId: asset?.teamId ?? standing.team.id,
  }
}

export function resolveSlot(
  slot: SlotRef,
  index: StandingsIndex,
  teamAssets: Map<string, GroupTeamAsset>,
): SlotView {
  switch (slot.kind) {
    case 'winner':
    case 'runnerUp': {
      const rank = slot.kind === 'winner' ? 1 : 2
      const seed = `${rank}º Grupo ${slot.group}`
      const team = resolveStandingTeam(index.byGroup.get(slot.group)?.[rank - 1], teamAssets)
      return team ? { type: 'team', team, seed } : { type: 'label', primary: seed }
    }
    case 'third':
      return { type: 'label', primary: 'Melhor 3º', secondary: slot.groups.join(' / ') }
    case 'matchWinner':
      return { type: 'label', primary: 'Vencedor' }
  }
}

/** true quando a API já entregou confrontos reais do mata-mata. */
export function hasApiKnockout(knockout: MatchesResponse['knockout']): boolean {
  return Object.values(knockout).some(arr => Array.isArray(arr) && arr.length > 0)
}

/** Mapa de bandeiras locais (base64) a partir dos jogos da fase de grupos. */
export function buildTeamAssetsFromGroupStage(
  groupStage: MatchesResponse['groupStage'],
): Map<string, GroupTeamAsset> {
  const matches = Object.values(groupStage)
    .flatMap(days => Object.values(days).flat())
    .map(match => ({ matchday: '', match }))
  return getGroupTeamAssets(matches)
}
