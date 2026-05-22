import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupAvatarProps {
  name: string
  coverUrl: string | null
  emoji?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

const emojiSizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
}

export function GroupAvatar({ name, coverUrl, emoji, size = 'md', className }: GroupAvatarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-soft)] text-[var(--brand)]',
        sizeClasses[size],
        className,
      )}
      aria-hidden={!coverUrl && !emoji}
    >
      {coverUrl ? (
        <img src={coverUrl} alt={name} className="h-full w-full object-cover" />
      ) : emoji ? (
        <span className={emojiSizeClasses[size]} role="img" aria-label={name}>{emoji}</span>
      ) : (
        <Trophy size={size === 'lg' ? 28 : 22} strokeWidth={1.8} />
      )}
    </div>
  )
}
