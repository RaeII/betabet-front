import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { findDefaultMatchday, groupMatchesByDay } from '@/lib/matchday.utils'
import type { MatchWithUserBet } from '@/types/match.types'
import { DayStripPill } from './DayStripPill'

interface DayStripProps {
  matches: MatchWithUserBet[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

const easeBrasil = [0.2, 0.8, 0.2, 1] as const

export function DayStrip({ matches, selectedDate, onSelectDate }: DayStripProps) {
  const [includePast, setIncludePast] = useState(false)

  const matchdays = useMemo(
    () => groupMatchesByDay(matches, { includePast }),
    [matches, includePast],
  )

  useEffect(() => {
    if (matchdays.length === 0) return
    if (selectedDate && matchdays.some(m => m.date === selectedDate)) return
    const idx = findDefaultMatchday(matchdays)
    onSelectDate(matchdays[idx].date)
  }, [matchdays, selectedDate, onSelectDate])

  if (matchdays.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-muted)]">
        Nenhuma partida no horizonte. Quando os jogos forem agendados eles aparecerão aqui.
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeBrasil }}
      className="space-y-2"
    >
      <div
        role="tablist"
        aria-label="Dias com partidas"
        className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: 'x proximity' }}
      >
        {matchdays.map(md => (
          <div key={md.date} className="shrink-0" style={{ scrollSnapAlign: 'start' }}>
            <DayStripPill
              matchday={md}
              selected={md.date === selectedDate}
              onSelect={() => onSelectDate(md.date)}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIncludePast(v => !v)}
        className="text-xs font-semibold text-[var(--text-muted)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]"
      >
        {includePast ? 'Ocultar dias passados' : 'Ver dias passados'}
      </button>
    </motion.div>
  )
}
