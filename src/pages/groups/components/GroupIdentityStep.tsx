import { useRef, useState } from 'react'
import { ChevronRight, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { detectMime, resizeToBase64 } from '@/lib/image.utils'

const EMOJI_OPTIONS = ['⚽', '🏆', '🎯', '🔥', '🏅', '🥇', '🎲', '👑']

interface GroupIdentityStepProps {
  name: string
  emoji: string | null
  coverUrl: string | null
  onNameChange: (name: string) => void
  onEmojiChange: (emoji: string | null) => void
  onCoverUrlChange: (url: string | null) => void
  onNext: () => void
  nameError: string
}

export function GroupIdentityStep({
  name,
  emoji,
  coverUrl,
  onNameChange,
  onEmojiChange,
  onCoverUrlChange,
  onNext,
  nameError,
}: GroupIdentityStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageError, setImageError] = useState<string | null>(null)

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
      onCoverUrlChange(dataUri)
      onEmojiChange(null)
    } catch {
      setImageError('Erro ao processar a imagem.')
    }
  }

  const displayName = name.trim() || 'Meu Bolão'
  const displayIcon = coverUrl ? (
    <img src={coverUrl} alt="capa" className="h-full w-full rounded-[var(--radius-lg)] object-cover" />
  ) : (
    <span className="text-2xl">{emoji ?? '⚽'}</span>
  )

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[var(--text)]">Como vai chamar o bolão?</h2>
        <p className="text-sm text-[var(--text-muted)]">Escolha um nome e uma identidade visual.</p>
      </div>

      <div className="flex flex-col gap-1">
        <Input
          label="Nome do bolão"
          placeholder="Nome do bolão"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={20}
          autoFocus
        />
        {nameError && <span className="text-xs text-[var(--danger)]">{nameError}</span>}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--text)]">Emoji ou imagem</p>
        <div className="grid grid-cols-8 gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => { onEmojiChange(e); onCoverUrlChange(null) }}
              className={[
                'flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-xl transition-colors',
                emoji === e && !coverUrl
                  ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                  : 'bg-[var(--surface-soft)] hover:bg-[var(--border)]',
              ].join(' ')}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="relative pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-[var(--brand)] bg-[var(--surface)] text-[var(--brand)] hover:bg-[var(--surface-soft)]"
          >
            <Upload size={16} />
            {coverUrl ? 'Trocar imagem do bolão' : 'Escolher imagem do bolão'}
          </Button>
          <div
            className="pointer-events-none absolute inset-x-0 top-full mt-1 h-4 overflow-hidden"
            aria-live="polite"
            aria-atomic="true"
          >
            <span
              className={[
                'block text-xs font-medium leading-4 text-[var(--danger)] transition duration-150',
                imageError ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
              ].join(' ')}
            >
              {imageError}
            </span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Prévia
        </p>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-soft)]">
            {displayIcon}
          </div>
          <p className="font-semibold text-[var(--text)]">{displayName}</p>
        </div>
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={name.trim().length < 3}
        className="w-full"
      >
        Próximo <ChevronRight size={16} className="ml-1" />
      </Button>
    </div>
  )
}
