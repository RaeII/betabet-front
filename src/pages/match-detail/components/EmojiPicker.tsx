import { ALLOWED_EMOJIS } from '@/types/bet.types'
import { useToggleReaction } from '@/hooks/useBets'
import { cn } from '@/lib/utils'
import type { EmojiReaction } from '@/types/bet.types'

interface EmojiPickerProps {
  betId: string
  reactions: EmojiReaction[]
  currentUserId: string
}

export function EmojiPicker({ betId, reactions, currentUserId }: EmojiPickerProps) {
  const toggleReaction = useToggleReaction()

  function countEmoji(emoji: string) {
    return reactions.filter(r => r.emoji === emoji).length
  }

  function hasReacted(emoji: string) {
    return reactions.some(r => r.emoji === emoji && r.userId === currentUserId)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALLOWED_EMOJIS.map(emoji => {
        const count = countEmoji(emoji)
        const reacted = hasReacted(emoji)
        return (
          <button
            key={emoji}
            onClick={() => toggleReaction.mutate({ betId, emoji })}
            disabled={toggleReaction.isPending}
            className={cn(
              'flex items-center gap-1 rounded-full border px-2 py-1 text-sm transition-colors',
              reacted
                ? 'border-[var(--brand)]/40 bg-[var(--brand)]/10 text-[var(--text)]'
                : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)] hover:border-[var(--brand)]/20',
            )}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-xs">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
