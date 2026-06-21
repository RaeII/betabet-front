import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

/** Checa por atualização do service worker a cada 5 minutos. */
const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000

/**
 * Banner de atualização do PWA.
 *
 * Com `registerType: 'prompt'` (ver `vite.config.ts`), um novo service worker
 * fica em estado *waiting* até o usuário aceitar. Quando isso acontece,
 * exibimos este banner; ao confirmar, `updateServiceWorker(true)` ativa o SW
 * novo e recarrega a página na versão atualizada — evitando trocar chunks no
 * meio de um palpite. Em dev o SW está desligado, então este componente nunca
 * dispara (ver `doc/012-pwa.md`).
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      // Checa por nova versão a cada 5 min e sempre que a aba volta ao foco
      // (corta a espera até o banner aparecer). Pula se offline ou se já há
      // uma instalação em curso — padrão recomendado pelo vite-plugin-pwa.
      const checkForUpdate = () => {
        if (registration.installing || !navigator.onLine) return
        registration.update().catch(() => {})
      }
      setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate()
      })
    },
  })

  const [updating, setUpdating] = useState(false)

  /**
   * Recarrega na versão nova quando o SW novo assume o controle.
   *
   * Único gatilho de reload: `controllerchange`. Ele só dispara quando
   * `navigator.serviceWorker.controller` JÁ é o SW novo (depois do
   * `clientsClaim()` do SW), então o reload sempre carrega os assets novos.
   *
   * Por que não recarregar antes: o estado `activated` do worker e o reload do
   * próprio plugin (gated por `event.isUpdate`) acontecem ANTES do swap de
   * controlador — `clients.claim()` é assíncrono. Recarregar nesse instante cai
   * na página ainda controlada pelo SW antigo → o NavigationRoute serve o
   * `index.html` antigo e o banner reaparece (o que parecia "travado").
   *
   * Para o SW novo assumir, pedimos `SKIP_WAITING`. No Android o worker em
   * espera costuma estar suspenso e perde a primeira mensagem (por isso antes o
   * skipWaiting só "pegava" minutos depois, atualizando sozinho). Reenviamos até
   * o `controllerchange` chegar. `updating` dá feedback imediato no botão.
   */
  function handleUpdate() {
    setUpdating(true)

    let reloaded = false
    const reload = () => {
      if (reloaded) return
      reloaded = true
      window.location.reload()
    }
    navigator.serviceWorker?.addEventListener('controllerchange', reload, { once: true })

    void navigator.serviceWorker?.getRegistration().then(registration => {
      const waiting = registration?.waiting
      if (!waiting) {
        // Sem SW em espera (já assumiu / foi trocado): recarrega no que controla.
        reload()
        return
      }
      // Reenvia SKIP_WAITING até o SW assumir (controllerchange dispara o
      // reload). Cobre o worker suspenso no Android que ignora a 1ª mensagem.
      let tries = 0
      const askSkipWaiting = () => {
        if (reloaded) return
        waiting.postMessage({ type: 'SKIP_WAITING' })
        tries += 1
        if (tries < 8) setTimeout(askSkipWaiting, 1500)
        else setUpdating(false) // último recurso: reabilita o botão, não trava
      }
      askSkipWaiting()
    })
  }

  if (!needRefresh) return null

  return (
    <div
      role="region"
      aria-label="Atualização disponível"
      className="fixed inset-x-0 bottom-0 z-[110] p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-md flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:flex-row sm:items-center sm:gap-5">
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text)]">Nova versão disponível.</span>{' '}
          Atualize para usar a versão mais recente do Bolão CLT.
        </p>
        <div className="flex shrink-0 gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={updating}
            onClick={() => setNeedRefresh(false)}
          >
            Agora não
          </Button>
          <Button variant="primary" size="sm" disabled={updating} onClick={handleUpdate}>
            {updating ? 'Atualizando…' : 'Atualizar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
