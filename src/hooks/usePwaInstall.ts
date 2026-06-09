import { useCallback, useSyncExternalStore } from 'react'

/**
 * Evento `beforeinstallprompt` (não tipado por padrão no TS DOM lib).
 * Disparado pelo Chrome/Android quando o app é instalável.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type PwaInstallMode = 'native' | 'ios-manual'

/** Verifica se a app já está rodando instalada (standalone). */
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const standaloneMedia = window.matchMedia('(display-mode: standalone)').matches
  // iOS Safari expõe `navigator.standalone` em vez do display-mode.
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true
  return standaloneMedia || iosStandalone
}

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const isiPhoneFamily = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isiPadDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isiPhoneFamily || isiPadDesktopMode
}

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const userAgent = navigator.userAgent
  const isSafari = /Safari/i.test(userAgent) && /WebKit/i.test(userAgent)
  const isAlternateIOSBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent)
  return isIOSDevice() && isSafari && !isAlternateIOSBrowser
}

interface PwaInstall {
  /** `true` quando há prompt nativo ou instalação manual via iOS Safari. */
  canInstall: boolean
  /** Indica se a instalação usa prompt nativo ou instrução manual do Safari/iOS. */
  installMode: PwaInstallMode | null
  /** Dispara o prompt nativo de instalação. */
  promptInstall: () => Promise<void>
}

type PwaInstallListener = () => void

let deferredPrompt: BeforeInstallPromptEvent | null = null
let isListening = false
const listeners = new Set<PwaInstallListener>()

function emitInstallPromptChange() {
  listeners.forEach(listener => listener())
}

function handleBeforeInstallPrompt(event: Event) {
  // Impede o mini-infobar padrão para controlarmos o momento do prompt.
  event.preventDefault()
  deferredPrompt = event as BeforeInstallPromptEvent
  emitInstallPromptChange()
}

function handleAppInstalled() {
  deferredPrompt = null
  emitInstallPromptChange()
}

export function startPwaInstallListener() {
  if (typeof window === 'undefined' || isListening || isStandalone()) return

  isListening = true
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
}

function subscribeToInstallPrompt(listener: PwaInstallListener) {
  startPwaInstallListener()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getInstallPromptSnapshot(): PwaInstallMode | null {
  if (isStandalone()) return null
  if (deferredPrompt) return 'native'
  if (isIOSSafari()) return 'ios-manual'
  return null
}

/**
 * Captura o evento `beforeinstallprompt` e expõe um gatilho para instalar o PWA.
 *
 * Em navegadores com suporte, `installMode` fica `native` e `promptInstall`
 * abre o prompt. No Safari/iOS não existe prompt programático; nesse caso,
 * `installMode` fica `ios-manual` para a UI orientar "Adicionar à Tela de
 * Início".
 */
export function usePwaInstall(): PwaInstall {
  const installMode = useSyncExternalStore(
    subscribeToInstallPrompt,
    getInstallPromptSnapshot,
    () => null,
  )

  const promptInstall = useCallback(async () => {
    const prompt = deferredPrompt
    if (!prompt) return
    // O prompt nativo só pode ser usado uma vez; descarta após o uso.
    deferredPrompt = null
    emitInstallPromptChange()
    await prompt.prompt()
    await prompt.userChoice
  }, [])

  return { canInstall: installMode !== null, installMode, promptInstall }
}
