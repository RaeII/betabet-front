import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { findDefaultMatchday, groupMatchesByDay } from '@/lib/matchday.utils'
import type { MatchWithUserBet } from '@/types/match.types'
import { DayStripPill } from './DayStripPill'

interface DayStripProps {
  matches: MatchWithUserBet[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

const easeBrasil = [0.2, 0.8, 0.2, 1] as const
const dragStartThreshold = 6
const dragScrollRatio = 0.72
const fallbackArrowScrollStep = 64

export function DayStrip({ matches, selectedDate, onSelectDate }: DayStripProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startScrollLeft: number
    moved: boolean
  } | null>(null)
  const suppressClickRef = useRef(false)
  const [hasHiddenLeft, setHasHiddenLeft] = useState(false)
  const [hasHiddenRight, setHasHiddenRight] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const matchdays = useMemo(() => groupMatchesByDay(matches, { includePast: true }), [matches])

  const syncHiddenDays = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)

    if (maxScroll <= 2) {
      setHasHiddenLeft(false)
      setHasHiddenRight(false)
      return
    }

    setHasHiddenLeft(el.scrollLeft > 2)
    setHasHiddenRight(el.scrollLeft < maxScroll - 2)
  }, [])

  useEffect(() => {
    if (matchdays.length === 0) return
    if (selectedDate && matchdays.some(m => m.date === selectedDate)) return
    const idx = findDefaultMatchday(matchdays)
    onSelectDate(matchdays[idx].date)
  }, [matchdays, selectedDate, onSelectDate])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onScroll = () => {
      syncHiddenDays()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', syncHiddenDays)
    const rafId = window.requestAnimationFrame(syncHiddenDays)

    return () => {
      window.cancelAnimationFrame(rafId)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', syncHiddenDays)
    }
  }, [syncHiddenDays, matchdays.length])

  useEffect(() => {
    if (!selectedDate) return
    const el = scrollRef.current
    if (!el) return
    const selectedItem = el.querySelector<HTMLElement>(`[data-day-date="${selectedDate}"]`)
    if (!selectedItem) return
    if (typeof selectedItem.scrollIntoView === 'function') {
      selectedItem.scrollIntoView({ block: 'nearest', inline: 'center' })
    }
    const rafId = window.requestAnimationFrame(syncHiddenDays)
    return () => window.cancelAnimationFrame(rafId)
  }, [selectedDate, syncHiddenDays])

  const endMouseDrag = useCallback((pointerId: number) => {
    const el = scrollRef.current
    if (!el) return
    const state = dragRef.current
    if (!state || state.pointerId !== pointerId) return
    if (state.moved) suppressClickRef.current = true
    dragRef.current = null
    setIsDragging(false)
    if (typeof el.hasPointerCapture === 'function' && el.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId)
    }
  }, [])

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.pointerType && event.pointerType !== 'mouse') || (event.button ?? 0) !== 0) return
    const el = scrollRef.current
    if (!el) return
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    }
    setIsDragging(true)
    if (typeof el.setPointerCapture === 'function') {
      el.setPointerCapture(event.pointerId)
    }
  }, [])

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current
    const el = scrollRef.current
    if (!state || !el || state.pointerId !== event.pointerId) return

    const deltaX = event.clientX - state.startX
    const absDeltaX = Math.abs(deltaX)
    if (!state.moved && absDeltaX > dragStartThreshold) {
      state.moved = true
    }

    if (!state.moved) return

    const effectiveDeltaX =
      deltaX > 0 ? deltaX - dragStartThreshold : deltaX + dragStartThreshold
    el.scrollLeft = state.startScrollLeft - effectiveDeltaX * dragScrollRatio
    syncHiddenDays()
    event.preventDefault()
  }, [syncHiddenDays])

  const handleClickCapture = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return
    suppressClickRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const scrollDays = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return

    const firstDay = el.firstElementChild as HTMLElement | null
    const gap = Number.parseFloat(window.getComputedStyle(el).columnGap) || 0
    const itemWidth = firstDay?.getBoundingClientRect().width || fallbackArrowScrollStep
    const distance = (itemWidth + gap) * direction

    if (typeof el.scrollBy === 'function') {
      el.scrollBy({ left: distance, behavior: 'smooth' })
    } else {
      el.scrollLeft += distance
    }

    window.requestAnimationFrame(syncHiddenDays)
  }, [syncHiddenDays])

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
      className="space-y-1"
    >
      <div className="relative">
        {hasHiddenLeft && (
          <button
            type="button"
            aria-label="Mostrar dias anteriores"
            data-testid="daystrip-hidden-left"
            onClick={() => scrollDays(-1)}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 text-[var(--text-muted)] shadow-sm transition duration-150 hover:border-[var(--brand)] hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]"
          >
            <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        )}

        {hasHiddenRight && (
          <button
            type="button"
            aria-label="Mostrar próximos dias"
            data-testid="daystrip-hidden-right"
            onClick={() => scrollDays(1)}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 text-[var(--text-muted)] shadow-sm transition duration-150 hover:border-[var(--brand)] hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--support)]"
          >
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        )}

        <div
          ref={scrollRef}
          role="tablist"
          aria-label="Dias com partidas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={event => endMouseDrag(event.pointerId)}
          onPointerCancel={event => endMouseDrag(event.pointerId)}
          onClickCapture={handleClickCapture}
          className={[
            'flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab scroll-smooth',
          ].join(' ')}
          style={{
            scrollBehavior: isDragging ? 'auto' : undefined,
            scrollSnapType: isDragging ? 'none' : 'x proximity',
            touchAction: 'pan-x',
          }}
        >
          {matchdays.map(md => (
            <div
              key={md.date}
              data-day-date={md.date}
              className="shrink-0"
              style={{ scrollSnapAlign: 'start' }}
            >
              <DayStripPill
                matchday={md}
                selected={md.date === selectedDate}
                onSelect={() => onSelectDate(md.date)}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
