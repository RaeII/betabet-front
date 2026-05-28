import { useEffect, useRef } from 'react'
import { useToast } from '@/context/toast.context'
import type { LiveEvent } from '@/services/liveMatch.service'

type ToastFn = ReturnType<typeof useToast>

function eventKey(e: LiveEvent): string {
  return `${e.minute}:${e.extra ?? 0}:${e.type}:${e.detail}:${e.teamId}:${e.player}`
}

function describe(e: LiveEvent, toast: ToastFn) {
  const minute = e.extra ? `${e.minute}'+${e.extra}` : `${e.minute}'`
  if (e.type === 'Goal' && e.detail !== 'Missed Penalty') {
    toast({
      title: `⚽ Gol do ${e.teamName}! ${e.player}${e.assist ? ` (assist: ${e.assist})` : ''} — ${minute}`,
      variant: 'success',
    })
    return
  }
  if (e.type === 'Card' && (e.detail === 'Red Card' || e.detail === 'Second Yellow card')) {
    toast({
      title: `🟥 Expulsão (${e.teamName}): ${e.player} — ${minute}`,
      variant: 'error',
    })
    return
  }
}

/**
 * Detecta novos `events` entre dois polls e dispara toasts para gols e
 * expulsões. O snapshot inicial não dispara notificações — só os deltas
 * a partir do segundo render.
 */
export function useLiveMatchNotifications(matchId: string, events: LiveEvent[] | undefined) {
  const toast = useToast()
  const seenRef = useRef<{ matchId: string | null; keys: Set<string> }>({
    matchId: null,
    keys: new Set(),
  })

  useEffect(() => {
    if (!matchId || !events) return

    // troca de partida → reseta baseline sem notificar
    if (seenRef.current.matchId !== matchId) {
      seenRef.current = {
        matchId,
        keys: new Set(events.map(eventKey)),
      }
      return
    }

    const newEvents: LiveEvent[] = []
    for (const e of events) {
      const k = eventKey(e)
      if (!seenRef.current.keys.has(k)) {
        seenRef.current.keys.add(k)
        newEvents.push(e)
      }
    }

    for (const e of newEvents) describe(e, toast)
  }, [matchId, events, toast])
}
