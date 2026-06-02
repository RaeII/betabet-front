import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ReferralSection } from './components/ReferralSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { detectMime, resizeToBase64 } from '@/lib/image.utils'
import { updateProfile } from '@/services/auth.service'
import { ApiRequestError } from '@/services/api'

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
      const dataUri = await resizeToBase64(file)
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
    <div className="mx-auto max-w-lg space-y-6">
      {/* Editar perfil */}
      <div className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-soft)] text-2xl font-bold text-[var(--brand)]">
            {avatarUrl ? (
              <img src={avatarUrl} alt={trimmedName || user.name} className="h-full w-full object-cover" />
            ) : (
              (trimmedName || user.name).charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="border-[var(--brand)] bg-[var(--surface)] text-[var(--brand)] hover:bg-[var(--surface-soft)]"
            >
              <Upload size={16} />
              {avatarUrl ? 'Trocar foto' : 'Adicionar foto'}
            </Button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className="self-start text-xs font-medium text-[var(--text-muted)] hover:text-[var(--danger)]"
              >
                Remover foto
              </button>
            )}
            {imageError && <span className="text-xs text-[var(--danger)]">{imageError}</span>}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col gap-1">
          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
          {!nameValid && trimmedName.length > 0 && (
            <span className="text-xs text-[var(--danger)]">O nome deve ter entre 3 e 120 caracteres.</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input label="E-mail" value={user.email} disabled readOnly />
          <span className="text-xs text-[var(--text-muted)]">O e-mail não pode ser alterado.</span>
        </div>

        {saveError && <span className="text-sm text-[var(--danger)]">{saveError}</span>}

        <Button type="button" className="w-full" onClick={handleSave} disabled={!canSave}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>

      {/* Referral */}
      <ReferralSection />

      {/* Logout */}
      <Button variant="secondary" className="w-full" onClick={logout}>
        Sair da conta
      </Button>
    </div>
  )
}
