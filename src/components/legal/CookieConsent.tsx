import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { loadAnalytics } from '@/lib/analytics'
import {
  COOKIE_SETTINGS_EVENT,
  getCookieConsent,
  setCookieConsent,
} from '@/lib/cookieConsent'

/**
 * Banner de consentimento de cookies (LGPD / Guia de Cookies da ANPD).
 *
 * Cookies analíticos (Google Analytics) só são carregados após o usuário
 * aceitar — `loadAnalytics()` nunca é chamado sem consentimento. A escolha
 * fica persistida em localStorage; enquanto não houver escolha, o banner é
 * exibido. O evento `COOKIE_SETTINGS_EVENT` reabre o banner.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const choice = getCookieConsent()
    if (choice === 'accepted') {
      loadAnalytics()
    } else if (choice === null) {
      setVisible(true)
    }

    const reopen = () => setVisible(true)
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen)
  }, [])

  if (!visible) return null

  function accept() {
    setCookieConsent('accepted')
    loadAnalytics()
    setVisible(false)
  }

  function reject() {
    setCookieConsent('rejected')
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:flex-row sm:items-center sm:gap-6">
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          Usamos cookies essenciais para o funcionamento da plataforma e, com seu
          consentimento, cookies de análise (Google Analytics) para entender o uso
          e melhorar sua experiência. Você pode aceitar ou recusar os cookies não
          essenciais. Saiba mais nos{' '}
          <a
            href="/terms"
            className="font-semibold text-[var(--brand)] underline underline-offset-2"
          >
            Termos e Política de Privacidade
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <Button variant="secondary" size="sm" onClick={reject}>
            Recusar
          </Button>
          <Button variant="primary" size="sm" onClick={accept}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  )
}
