import { useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { GroupAvatar } from '@/pages/groups/components/GroupAvatar'
import { useUpdateGroup } from '@/hooks/useGroups'
import { detectMime, resizeToBase64 } from '@/lib/image.utils'
import type { BettingGroup } from '@/types/group.types'

const EMOJI_OPTIONS = ['⚽', '🏆', '🎯', '🔥', '🏅', '🥇', '🎲', '👑']

interface GroupImageEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: BettingGroup
}

export function GroupImageEditor({ open, onOpenChange, group }: GroupImageEditorProps) {
  const update = useUpdateGroup(group.id)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [emoji, setEmoji] = useState<string | null>(group.emoji)
  const [coverUrl, setCoverUrl] = useState<string | null>(group.coverUrl)
  const [imageError, setImageError] = useState<string | null>(null)

  // Sincroniza os campos sempre que o modal abre ou o grupo muda, descartando
  // edições não salvas de uma abertura anterior.
  useEffect(() => {
    if (open) {
      setEmoji(group.emoji)
      setCoverUrl(group.coverUrl)
      setImageError(null)
    }
  }, [open, group.emoji, group.coverUrl])

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
      setCoverUrl(dataUri)
      setEmoji(null)
    } catch {
      setImageError('Erro ao processar a imagem.')
    }
  }

  function handleSave() {
    update.mutate(
      { emoji, coverUrl },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Imagem do bolão"
      description="Escolha um emoji ou envie uma imagem para identificar o bolão."
    >
      <div className="space-y-6 p-5">
        <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <GroupAvatar name={group.name} coverUrl={coverUrl} emoji={emoji} size="lg" />
          <p className="font-semibold text-[var(--text)]">{group.name}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--text)]">Emoji</p>
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { setEmoji(e); setCoverUrl(null) }}
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-xl transition-colors',
                  emoji === e && !coverUrl
                    ? 'bg-[var(--brand)] text-[var(--brand-text)]'
                    : 'bg-[var(--surface)] hover:bg-[var(--border)]',
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

        <div className="space-y-2 pt-2">
          <div className="min-h-4 overflow-hidden" aria-live="polite" aria-atomic="true">
            <p
              className={`text-xs font-medium leading-4 text-[var(--danger)] transition duration-150 ${
                update.isError ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
              }`}
            >
              Erro ao salvar a imagem. Tente novamente.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              type="button"
              onClick={handleSave}
              disabled={update.isPending}
              className="w-full sm:w-auto"
            >
              {update.isPending ? 'Salvando…' : 'Salvar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={update.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
