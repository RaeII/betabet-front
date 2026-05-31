import { TeamFlagImage } from './TeamFlagImage'

interface TeamFlagProps {
  name: string
  flagUrl: string
  teamId?: string | number | null
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { img: 'h-5 w-7', text: 'text-xs' },
  md: { img: 'h-7 w-10', text: 'text-sm' },
  lg: { img: 'h-10 w-14', text: 'text-base' },
}

export function TeamFlag({ name, flagUrl, teamId, size = 'md' }: TeamFlagProps) {
  const { img, text } = sizes[size]

  return (
    <div className="flex flex-col items-center gap-1">
      <TeamFlagImage
        src={flagUrl}
        teamId={teamId}
        alt={`Bandeira ${name}`}
        className={`${img} rounded object-contain shadow-sm`}
      />
      <span className={`${text} font-semibold text-[var(--text)] text-center leading-tight`}>
        {name}
      </span>
    </div>
  )
}
