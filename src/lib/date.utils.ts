const BET_LOCK_MINUTES = 15

/**
 * Prazo final para o admin editar as configurações do bolão. A partir do
 * primeiro jogo da Copa (11 de jun de 2026, 16:00 horário de Brasília) as
 * configurações ficam congeladas. O backend é a fonte de verdade — isto é só UX.
 */
//export const GROUP_CONFIG_LOCK_DEADLINE = new Date('2026-06-11T16:00:00-03:00')
export const GROUP_CONFIG_LOCK_DEADLINE = new Date('2026-06-11T16:00:00-03:00')


export function isGroupConfigLocked(now: Date = new Date()): boolean {
  return now.getTime() >= GROUP_CONFIG_LOCK_DEADLINE.getTime()
}

/** Formata o prazo como "11 de jun, 16:00". */
export function formatGroupConfigDeadline(): string {
  return GROUP_CONFIG_LOCK_DEADLINE.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function minutesUntilKickoff(scheduledAt: string): number {
  const kickoff = new Date(scheduledAt).getTime()
  const now = Date.now()
  return Math.floor((kickoff - now) / 60_000)
}

export function secondsUntilKickoff(scheduledAt: string): number {
  const kickoff = new Date(scheduledAt).getTime()
  const now = Date.now()
  return Math.floor((kickoff - now) / 1000)
}

export function isBetEditable(scheduledAt: string): boolean {
  return minutesUntilKickoff(scheduledAt) > BET_LOCK_MINUTES
}

export function isMatchToday(scheduledAt: string): boolean {
  const match = new Date(scheduledAt)
  const today = new Date()
  return (
    match.getFullYear() === today.getFullYear() &&
    match.getMonth() === today.getMonth() &&
    match.getDate() === today.getDate()
  )
}

export function isMatchTomorrow(scheduledAt: string): boolean {
  const match = new Date(scheduledAt)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    match.getFullYear() === tomorrow.getFullYear() &&
    match.getMonth() === tomorrow.getMonth() &&
    match.getDate() === tomorrow.getDate()
  )
}

export function formatTimeOnly(scheduledAt: string): string {
  return new Date(scheduledAt).toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCountdownMmSs(secondsLeft: number): string {
  if (secondsLeft <= 0) return 'Iniciado'
  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
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
