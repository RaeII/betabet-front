import { useCallback, useSyncExternalStore } from 'react'

// Marca uma novidade como vista uma única vez. Persiste em localStorage e
// sincroniza entre componentes montados na mesma aba (sidebar e mobile nav).

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

function readSeen(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return true // localStorage indisponível → não insiste no badge
  }
}

/** Retorna `[isNew, markSeen]`. `isNew` some assim que `markSeen` é chamado. */
export function useSeenFlag(key: string): [boolean, () => void] {
  const seen = useSyncExternalStore(
    subscribe,
    () => readSeen(key),
    () => true,
  )

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(key, '1')
    } catch {
      /* ignore */
    }
    listeners.forEach(listener => listener())
  }, [key])

  return [!seen, markSeen]
}
