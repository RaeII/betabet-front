import { useRef, useState } from 'react'
import { ChevronRight, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

async function detectMime(file: File): Promise<'image/jpeg' | 'image/png' | 'image/webp' | null> {
  const buf = await file.slice(0, 12).arrayBuffer()
  const b = new Uint8Array(buf)
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp'
  return null
}

function resizeToBase64(file: File, maxDim = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('invalid')) }
    img.src = url
  })
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

  const displayName = name.trim() || 'Meu Grupo'
  const displayIcon = coverUrl ? (
    <img src={coverUrl} alt="capa" className="h-full w-full rounded-[var(--radius-lg)] object-cover" />
  ) : (
    <span className="text-2xl">{emoji ?? '⚽'}</span>
  )

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[var(--text)]">Como vai chamar o grupo?</h2>
        <p className="text-sm text-[var(--text-muted)]">Escolha um nome e uma identidade visual.</p>
      </div>

      <div className="flex flex-col gap-1">
        <Input
          label="Nome do grupo"
          placeholder="Nome do grupo"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={50}
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
            {coverUrl ? 'Trocar imagem do grupo' : 'Escolher imagem do grupo'}
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
