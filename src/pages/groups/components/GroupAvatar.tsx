import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupAvatarProps {
  name: string
  coverUrl: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

export function GroupAvatar({ name, coverUrl, size = 'md', className }: GroupAvatarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-soft)] text-[var(--brand)]',
        sizeClasses[size],
        className,
      )}
      aria-hidden={!coverUrl}
    >
      {coverUrl ? (
        <img src={coverUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <Trophy size={size === 'lg' ? 28 : 22} strokeWidth={1.8} />
      )}
    </div>
  )
}
