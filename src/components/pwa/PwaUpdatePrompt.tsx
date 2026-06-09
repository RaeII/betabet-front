import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

/** Checa por atualização do service worker a cada 60 minutos. */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

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
      setInterval(() => {
        registration.update().catch(() => {})
      }, UPDATE_CHECK_INTERVAL_MS)
    },
  })

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
          <Button variant="secondary" size="sm" onClick={() => setNeedRefresh(false)}>
            Agora não
          </Button>
          <Button variant="primary" size="sm" onClick={() => updateServiceWorker(true)}>
            Atualizar
          </Button>
        </div>
      </div>
    </div>
  )
}
