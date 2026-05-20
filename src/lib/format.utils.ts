export function formatScore(home: number | null, away: number | null): string {
  if (home === null || away === null) return '– × –'
  return `${home} × ${away}`
}

export function formatPct(value: number): string {
  return `${Math.round(value)}%`
}

export function formatRank(position: number): string {
  return `${position}°`
}
