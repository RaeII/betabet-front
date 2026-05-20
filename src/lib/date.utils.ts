const BET_LOCK_MINUTES = 15

export function minutesUntilKickoff(scheduledAt: string): number {
  const kickoff = new Date(scheduledAt).getTime()
  const now = Date.now()
  return Math.floor((kickoff - now) / 60_000)
}

export function isBetEditable(scheduledAt: string): boolean {
  return minutesUntilKickoff(scheduledAt) > BET_LOCK_MINUTES
}

export function formatMatchDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCountdown(isoString: string): string {
  const minutes = minutesUntilKickoff(isoString)
  if (minutes <= 0) return 'Iniciado'
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}min` : `${hours}h`
}
