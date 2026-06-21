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
    updateServiceWorker,
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
   * Ativa o SW novo e recarrega assim que ele assumir.
   *
   * O reload embutido do vite-plugin-pwa só dispara no evento `controlling`
   * quando `event.isUpdate` é `true` — e `isUpdate` reflete se havia um SW
   * controlando a página *no momento do registro*. Numa página não-controlada
   * (hard reload, primeiro load, quirks do iOS) `isUpdate` é `false` e o reload
   * nunca acontece, travando o banner.
   *
   * Disparamos o reload por três gatilhos, o que vier primeiro:
   *  - `statechange → activated` do SW em espera (mais cedo: não espera o
   *    `clients.claim()`);
   *  - `controllerchange` (quando o `clientsClaim()` do SW assume);
   *  - um backstop por tempo, caso o Android atrase o ciclo de vida do SW.
   * O estado `updating` dá feedback imediato — sem ele o botão parece morto
   * durante o (lento) ciclo de ativação do SW no Android.
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
        // Sem SW em espera (já ativou / foi trocado): recarrega no que controla.
        reload()
        return
      }
      waiting.addEventListener('statechange', () => {
        if (waiting.state === 'activated') reload()
      })
      updateServiceWorker(true) // posta SKIP_WAITING → ativa o SW em espera
      // Rede de segurança APENAS. `controllerchange`/`activated` normalmente
      // disparam em <1s. Recarregar cedo demais (3s era pouco no Android sob
      // carga) cai na página AINDA controlada pelo SW antigo → o NavigationRoute
      // serve o index.html antigo e o banner reaparece, parecendo "travado".
      // 10s dá folga pro SW novo assumir; este timer só age se o ciclo de vida
      // do SW realmente falhar — aí recarregar é a melhor recuperação possível.
      setTimeout(reload, 10000)
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
