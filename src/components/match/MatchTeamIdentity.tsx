import { cn } from '@/lib/utils'
import { TeamFlagImage } from './TeamFlagImage'

type MatchTeamIdentitySize = 'sm' | 'md'

interface MatchTeamIdentityProps {
  name: string
  flagUrl: string
  teamId: string | number | null
  size?: MatchTeamIdentitySize
  className?: string
}

const sizeClassNames: Record<
  MatchTeamIdentitySize,
  { flag: string; fallbackText: string; name: string }
> = {
  sm: {
    flag: 'h-9 w-12 sm:h-10 sm:w-14',
    fallbackText: 'text-xs',
    name: 'text-xs',
  },
  md: {
    flag: 'h-11 w-14 sm:h-12 sm:w-16',
    fallbackText: 'text-sm',
    name: 'text-xs sm:text-[13px]',
  },
}

export function MatchTeamIdentity({
  name,
  flagUrl,
  teamId,
  size = 'md',
  className,
}: MatchTeamIdentityProps) {
  const classes = sizeClassNames[size]

  return (
    <div className={cn('flex w-full min-w-0 flex-col items-center gap-1.5 text-center', className)}>
      {flagUrl ? (
        <TeamFlagImage
          src={flagUrl}
          teamId={teamId}
          alt={name}
          className={cn(classes.flag, 'object-contain')}
        />
      ) : (
        <span
          className={cn(
            classes.flag,
            classes.fallbackText,
            'flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-soft)] font-bold text-[var(--brand)]',
          )}
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <span
        className={cn(
          'max-w-full truncate font-semibold leading-4 text-[var(--text)]',
          classes.name,
        )}
      >
        {name}
      </span>
    </div>
  )
}
