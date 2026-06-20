import { useRef, useState } from 'react'
import { Bell, BellOff, Camera, Loader2, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import type { PushNotificationStatus } from '@/hooks/usePushNotifications'
import { ReferralSection } from './components/ReferralSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { detectMime, resizeToBase64 } from '@/lib/image.utils'
import { updateProfile } from '@/services/auth.service'
import { ApiRequestError } from '@/services/api'

function notificationStatus(status: PushNotificationStatus, error: string | null) {
  if (error) return error
  if (status === 'active') return 'Ativas neste aparelho.'
  if (status === 'denied') return 'Bloqueadas nas permissões do sistema.'
  if (status === 'unavailable') return 'Indisponíveis no momento.'
  if (status === 'unsupported') return 'Disponíveis apenas no app instalado.'
  if (status === 'checking') return 'Verificando aparelho.'
  return 'Desativadas neste aparelho.'
}

function NotificationSettingsCard() {
  const push = usePushNotifications()
  const active = push.isActive
  const disabled =
    push.busy ||
    push.status === 'checking' ||
    push.status === 'unsupported' ||
    push.status === 'unavailable' ||
    push.status === 'denied'

  return (
    <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--brand)]">
          {active ? <Bell aria-hidden="true" size={18} /> : <BellOff aria-hidden="true" size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-[var(--text)]">Notificações neste aparelho</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {notificationStatus(push.status, push.error)}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant={active ? 'secondary' : 'primary'}
        className="w-full"
        disabled={disabled}
        onClick={() => {
          void (active ? push.disable() : push.enable())
        }}
      >
        {push.busy ? <Loader2 aria-hidden="true" size={16} className="animate-spin" /> : null}
        {active ? 'Desativar notificações' : 'Ativar notificações'}
      </Button>
    </div>
  )
}

export function ProfilePage() {
  const { user, setUser, logout } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const trimmedName = name.trim()
  const nameValid = trimmedName.length >= 3 && trimmedName.length <= 120
  const dirty = trimmedName !== user.name || avatarUrl !== (user.avatarUrl ?? null)
  const canSave = dirty && nameValid && !saving

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const mime = await detectMime(file)
    if (!mime) {
      setImageError('Formato inválido. Use JPEG, PNG ou WebP.')
      return
    }
    setImageError(null)

    try {
      const dataUri = await resizeToBase64(file, 200)
      setAvatarUrl(dataUri)
    } catch {
      setImageError('Erro ao processar a imagem.')
    }
  }

  async function handleSave() {
    if (!canSave || !user) return
    setSaving(true)
    setSaveError(null)
    try {
      const { user: updated } = await updateProfile({
        name: trimmedName !== user.name ? trimmedName : undefined,
        avatarUrl: avatarUrl !== (user.avatarUrl ?? null) ? avatarUrl : undefined,
      })
      setUser(updated)
    } catch (err) {
      setSaveError(err instanceof ApiRequestError ? err.message : 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Editar perfil */}
      <div className="space-y-5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[var(--surface-soft)] text-3xl font-bold text-[var(--brand)]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={trimmedName || user.name} className="h-full w-full object-cover" />
              ) : (
                (trimmedName || user.name).charAt(0).toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--brand)] text-[var(--brand-text)] shadow-sm transition duration-150 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--support)]"
              aria-label={avatarUrl ? 'Trocar foto' : 'Adicionar foto'}
              title={avatarUrl ? 'Trocar foto' : 'Adicionar foto'}
            >
              <Camera size={15} />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Perfil</p>
            <h1 className="mt-1 truncate text-xl font-semibold leading-tight text-[var(--text)]">
              {trimmedName || user.name}
            </h1>
            <p className="mt-1 truncate text-sm text-[var(--text-muted)]">{user.email}</p>
            {(avatarUrl || imageError) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl(null)}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--danger)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--support)]"
                  >
                    <X size={14} />
                    Remover foto
                  </button>
                )}
                {imageError && (
                  <p role="alert" className="text-xs font-medium text-[var(--danger)]">
                    {imageError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="space-y-5 border-t border-[var(--border)] pt-5">
          <div className="flex flex-col gap-1.5">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
            />
            {!nameValid && trimmedName.length > 0 && (
              <span className="text-xs font-medium text-[var(--danger)]">
                O nome deve ter entre 3 e 120 caracteres.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Input label="E-mail" value={user.email} disabled readOnly />
            <span className="text-xs font-medium text-[var(--text-muted)]">O e-mail não pode ser alterado.</span>
          </div>
        </div>

        {saveError && <span className="text-sm text-[var(--danger)]">{saveError}</span>}

        <Button type="button" className="w-full" onClick={handleSave} disabled={!canSave}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>

      {/* Referral */}
      <ReferralSection />

      <NotificationSettingsCard />

      {/* Logout */}
      <Button variant="secondary" className="w-full" onClick={logout}>
        Sair do app
      </Button>
    </div>
  )
}
