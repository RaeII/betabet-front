import { useMemo, useState } from 'react'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useGroupMatches } from '@/hooks/useGroupMatches'
import { useAuth } from '@/hooks/useAuth'
import { useBettingProgress } from '@/hooks/useBettingProgress'
import { findDefaultMatchday, groupMatchesByDay } from '@/lib/matchday.utils'
import { DayStrip } from './components/DayStrip'
import { DayMatchList } from './components/DayMatchList'
import { BettingProgressBar } from './components/BettingProgressBar'

export function HomePage() {
  const { groupId, group } = useActiveGroup()
  const { user } = useAuth()
  const { data, isLoading, isError } = useGroupMatches(groupId ?? '')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const matches = data?.matches ?? []

  const matchdays = useMemo(() => groupMatchesByDay(matches, { includePast: true }), [matches])
  const upcomingMatchdays = useMemo(() => matchdays.filter(day => !day.isPast), [matchdays])

  const currentDate = useMemo(() => {
    if (selectedDate && matchdays.some(m => m.date === selectedDate)) {
      return selectedDate
    }
    if (matchdays.length === 0) return null
    return matchdays[findDefaultMatchday(matchdays)].date
  }, [selectedDate, matchdays])

  const currentMatchday = matchdays.find(m => m.date === currentDate) ?? null
  const progress = useBettingProgress(upcomingMatchdays)

  if (!groupId || !group) return null

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">
        Carregando partidas…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--danger)]">
        Erro ao carregar partidas.
      </div>
    )
  }

  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <div className="space-y-5">
      <section className="space-y-1">
        <h2 className="text-base font-semibold text-[var(--text)]">
          {firstName ? `Olá, ${firstName}` : 'Olá!'}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Veja os jogos do dia e salve seus palpites em segundos.
        </p>
      </section>

      <BettingProgressBar
        progress={progress}
        greeting={firstName ? `${firstName}, seus palpites` : 'Seus palpites'}
      />

      <DayStrip
        matches={matches}
        selectedDate={currentDate}
        onSelectDate={setSelectedDate}
      />

      {currentMatchday ? (
        <DayMatchList matches={currentMatchday.matches} group={group} />
      ) : (
        <p className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-muted)]">
          Nenhuma partida disponível para apostar agora.
        </p>
      )}
    </div>
  )
}
