// Persistência da escolha de cookies do usuário (LGPD / Guia de Cookies ANPD).
//
// Guardamos apenas a decisão sobre cookies NÃO essenciais (analíticos).
// Cookies essenciais (sessão, segurança) não dependem de consentimento.

export type CookieConsentChoice = 'accepted' | 'rejected'

const STORAGE_KEY = 'bolaoclt:cookie-consent'
// Versão da política de cookies. Incrementar aqui força um novo consentimento
// (por exemplo, quando novas ferramentas de análise forem adicionadas).
const CONSENT_VERSION = '1'

interface StoredConsent {
  choice: CookieConsentChoice
  version: string
  at: string
}

/** Evento disparado para reabrir o banner ("gerenciar cookies"). */
export const COOKIE_SETTINGS_EVENT = 'cookie-consent:open'

export function getCookieConsent(): CookieConsentChoice | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredConsent>
    if (parsed.version !== CONSENT_VERSION) return null
    return parsed.choice === 'accepted' || parsed.choice === 'rejected'
      ? parsed.choice
      : null
  } catch {
    return null
  }
}

export function setCookieConsent(choice: CookieConsentChoice): void {
  if (typeof window === 'undefined') return
  try {
    const value: StoredConsent = {
      choice,
      version: CONSENT_VERSION,
      at: new Date().toISOString(),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* localStorage indisponível (modo privado/cota) — ignora silenciosamente */
  }
}

/** Reabre o banner de consentimento para o usuário rever sua escolha. */
export function openCookieSettings(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))
}
