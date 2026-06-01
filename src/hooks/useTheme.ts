import { useEffect, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const listeners = new Set<() => void>()

let currentTheme: Theme | null = null

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getThemeSnapshot(): Theme {
  currentTheme ??= getInitialTheme()
  return currentTheme
}

function getServerThemeSnapshot(): Theme {
  return 'dark'
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  localStorage.setItem(STORAGE_KEY, theme)
}

function setSharedTheme(theme: Theme) {
  const previousTheme = getThemeSnapshot()
  currentTheme = theme
  applyTheme(theme)

  if (previousTheme === theme) return
  listeners.forEach(listener => listener())
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerThemeSnapshot)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function toggleTheme() {
    setSharedTheme(getThemeSnapshot() === 'dark' ? 'light' : 'dark')
  }

  function setTheme(t: Theme) {
    setSharedTheme(t)
  }

  return { theme, toggleTheme, setTheme }
}
