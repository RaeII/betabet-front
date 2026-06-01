import type { Match, MatchesResponse } from '@/types/match.types'
import type { WorldCupStanding } from '@/types/worldCup.types'

export interface GroupMatch {
  matchday: string
  match: Match
}

export interface GroupRound {
  value: string
  label: string
  matches: Match[]
}

export interface GroupTeamAsset {
  flagUrl: string
  teamId: string | number | null
}

const GROUP_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export function normalizeTeamName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

export function teamAssetIdKey(value: string | number): string {
  return `id:${String(value)}`
}

export function teamAssetNameKey(value: string): string {
  return `name:${normalizeTeamName(value)}`
}

export function normalizeGroupLetter(value: string | null | undefined): string {
  if (!value) return ''
  const clean = value.trim().toUpperCase()
  if (GROUP_ORDER.includes(clean)) return clean
  const match = clean.match(/(?:GROUP|GRUPO)\s+([A-L])/) ?? clean.match(/\b([A-L])\b/)
  return match?.[1] ?? clean
}

export function sortGroupLetters(a: string, b: string) {
  const aIndex = GROUP_ORDER.indexOf(a)
  const bIndex = GROUP_ORDER.indexOf(b)
  if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex
  if (aIndex >= 0) return -1
  if (bIndex >= 0) return 1
  return a.localeCompare(b)
}

export function getMatchdayNumber(value: string): number {
  return Number(value.match(/\d+/)?.[0] ?? 0)
}

export function getMatchdayLabel(value: string): string {
  const number = getMatchdayNumber(value)
  return number ? `Rodada ${number}` : value
}

export function getGroupMatches(
  data: MatchesResponse['groupStage'],
  groupLetter: string,
): GroupMatch[] {
  const entry = Object.entries(data).find(([key]) => normalizeGroupLetter(key) === groupLetter)
  if (!entry) return []

  return Object.entries(entry[1])
    .flatMap(([matchday, matches]) => matches.map(match => ({ matchday, match })))
    .sort((a, b) => {
      const roundDiff = getMatchdayNumber(a.matchday) - getMatchdayNumber(b.matchday)
      if (roundDiff !== 0) return roundDiff
      return new Date(a.match.scheduledAt).getTime() - new Date(b.match.scheduledAt).getTime()
    })
}

export function getGroupRounds(matches: GroupMatch[]): GroupRound[] {
  const rounds = new Map<string, Match[]>()

  matches.forEach(({ matchday, match }) => {
    rounds.set(matchday, [...(rounds.get(matchday) ?? []), match])
  })

  return [...rounds.entries()]
    .sort(([a], [b]) => {
      const roundDiff = getMatchdayNumber(a) - getMatchdayNumber(b)
      if (roundDiff !== 0) return roundDiff
      return a.localeCompare(b)
    })
    .map(([value, roundMatches]) => ({
      value,
      label: getMatchdayLabel(value),
      matches: [...roundMatches].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    }))
}

export function getGroupTeamAssets(matches: GroupMatch[]): Map<string, GroupTeamAsset> {
  const assets = new Map<string, GroupTeamAsset>()

  matches.forEach(({ match }) => {
    const teams = [match.homeTeam, match.awayTeam]

    teams.forEach(team => {
      const asset = {
        flagUrl: team.flagUrl,
        teamId: team.id,
      }
      const keys = [teamAssetIdKey(team.id), teamAssetNameKey(team.name)]

      keys.forEach(key => {
        const current = assets.get(key)

        if (!current || (!current.flagUrl && team.flagUrl)) {
          assets.set(key, asset)
        }
      })
    })
  })

  return assets
}

export function findDefaultRound(rounds: GroupRound[]): string | null {
  const live = rounds.find(round => round.matches.some(match => match.status === 'live'))
  if (live) return live.value

  const now = Date.now()
  const next = rounds
    .flatMap(round =>
      round.matches.map(match => ({
        value: round.value,
        time: new Date(match.scheduledAt).getTime(),
      })),
    )
    .filter(match => match.time >= now)
    .sort((a, b) => a.time - b.time)[0]
  if (next) return next.value

  const previous = rounds
    .flatMap(round =>
      round.matches.map(match => ({
        value: round.value,
        time: new Date(match.scheduledAt).getTime(),
      })),
    )
    .filter(match => match.time < now)
    .sort((a, b) => b.time - a.time)[0]

  return previous?.value ?? rounds[0]?.value ?? null
}

export function findDefaultGroup(
  data: MatchesResponse['groupStage'],
  groups: string[],
): string | null {
  const liveGroup = groups.find(group =>
    getGroupMatches(data, group).some(({ match }) => match.status === 'live'),
  )
  if (liveGroup) return liveGroup

  const now = Date.now()
  const nextGroup = groups
    .map(group => ({
      group,
      nextTime: getGroupMatches(data, group)
        .map(({ match }) => new Date(match.scheduledAt).getTime())
        .filter(time => time >= now)
        .sort((a, b) => a - b)[0],
    }))
    .filter((item): item is { group: string; nextTime: number } => item.nextTime !== undefined)
    .sort((a, b) => a.nextTime - b.nextTime)[0]

  return nextGroup?.group ?? groups[0] ?? null
}

export function rowUpdate(rows: WorldCupStanding[], fallback?: string): string | undefined {
  return rows.find(row => row.update)?.update ?? fallback
}
