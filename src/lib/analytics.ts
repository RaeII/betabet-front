// Carregamento sob demanda do Google Analytics (gtag.js).
//
// O script do GA NÃO é injetado no carregamento da página: ele só é ativado
// depois que o usuário consente com cookies analíticos (ver CookieConsent).
// Isso atende ao Guia de Cookies da ANPD, que trata cookies analíticos como
// dependentes de consentimento prévio (opt-in).

const GA_MEASUREMENT_ID = 'G-FHEMXXLVJ4'

let loaded = false

/** Injeta o gtag.js e inicializa o GA. Idempotente. */
export function loadAnalytics(): void {
  if (loaded || typeof window === 'undefined' || !GA_MEASUREMENT_ID) return
  loaded = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  const w = window as unknown as {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
  w.dataLayer = w.dataLayer || []
  w.gtag = function gtag() {
    // O gtag espera o objeto `arguments` (array-like) em cada push.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments)
  }
  w.gtag('js', new Date())
  w.gtag('config', GA_MEASUREMENT_ID)
}
