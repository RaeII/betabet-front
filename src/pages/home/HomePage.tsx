import { useCallback, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useGroupMatches } from '@/hooks/useGroupMatches'
import { useAuth } from '@/hooks/useAuth'
import { useBettingProgress } from '@/hooks/useBettingProgress'
import { findDefaultMatchday, groupMatchesByDay } from '@/lib/matchday.utils'
import { Input } from '@/components/ui/input'
import type { MatchWithUserBet } from '@/types/match.types'
import { DayStrip } from './components/DayStrip'
import { DayMatchList } from './components/DayMatchList'
import { BettingProgressBar } from './components/BettingProgressBar'
import { ChampionBetCard } from './components/ChampionBetCard'

function normalizeTeamSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function matchHasTeamSearch(match: MatchWithUserBet, term: string) {
  const homeTeam = normalizeTeamSearch(match.homeTeam.name)
  const awayTeam = normalizeTeamSearch(match.awayTeam.name)
  return homeTeam.includes(term) || awayTeam.includes(term)
}

export function HomePage() {
  const { groupId, group } = useActiveGroup()
  const { user } = useAuth()
  const { data, isLoading, isError } = useGroupMatches(groupId ?? '')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [teamSearch, setTeamSearch] = useState('')

  const matches = data?.matches ?? []

  const matchdays = useMemo(() => groupMatchesByDay(matches, { includePast: true }), [matches])
  const upcomingMatchdays = useMemo(() => matchdays.filter(day => !day.isPast), [matchdays])
  const teamSearchTerm = useMemo(() => normalizeTeamSearch(teamSearch), [teamSearch])

  const highlightedMatchDates = useMemo(() => {
    if (!teamSearchTerm) return new Set<string>()

    return new Set(
      matchdays
        .filter(day => day.matches.some(match => matchHasTeamSearch(match, teamSearchTerm)))
        .map(day => day.date),
    )
  }, [matchdays, teamSearchTerm])

  const currentDate = useMemo(() => {
    if (selectedDate && matchdays.some(m => m.date === selectedDate)) {
      return selectedDate
    }
    if (matchdays.length === 0) return null
    return matchdays[findDefaultMatchday(matchdays)].date
  }, [selectedDate, matchdays])

  const currentMatchday = matchdays.find(m => m.date === currentDate) ?? null
  const visibleMatches = useMemo(() => {
    if (teamSearchTerm) {
      return matches.filter(match => matchHasTeamSearch(match, teamSearchTerm))
    }

    return currentMatchday?.matches ?? []
  }, [currentMatchday, matches, teamSearchTerm])
  const progress = useBettingProgress(upcomingMatchdays)

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date)
    setTeamSearch('')
  }, [])

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
          Veja os jogos do dia e salve seus palpites
        </p>
      </section>

      <ChampionBetCard groupId={groupId} />

      <BettingProgressBar
        progress={progress}
        greeting={firstName ? `${firstName}, seus palpites` : 'Seus palpites'}
      />

      <DayStrip
        matches={matches}
        selectedDate={currentDate}
        onSelectDate={handleSelectDate}
        highlightedDates={highlightedMatchDates}
      />

      {currentMatchday ? (
        <div className="relative mx-auto w-full max-w-[42rem]">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <Input
            type="search"
            value={teamSearch}
            onChange={e => setTeamSearch(e.target.value)}
            placeholder="Filtrar por seleção"
            aria-label="Filtrar partidas por seleção"
            className="min-h-11 rounded-full bg-[var(--surface-soft)] pl-10 pr-11"
          />
          {teamSearch ? (
            <button
              type="button"
              aria-label="Limpar filtro de seleção"
              onClick={() => setTeamSearch('')}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] transition duration-150 hover:bg-[var(--surface)] hover:text-[var(--text)] active:scale-95"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      {currentMatchday ? (
        visibleMatches.length > 0 ? (
          <DayMatchList matches={visibleMatches} group={group} />
        ) : (
          <p className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 text-center text-sm text-[var(--text-muted)]">
            {teamSearchTerm
              ? 'Nenhuma partida encontrada para esta seleção.'
              : 'Nenhuma partida neste dia.'}
          </p>
        )
      ) : (
        <p className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-muted)]">
          Nenhuma partida disponível para apostar agora.
        </p>
      )}
    </div>
  )
}
