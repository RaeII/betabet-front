interface TeamFlagProps {
  name: string
  flagUrl: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { img: 'h-5 w-7', text: 'text-xs' },
  md: { img: 'h-7 w-10', text: 'text-sm' },
  lg: { img: 'h-10 w-14', text: 'text-base' },
}

export function TeamFlag({ name, flagUrl, size = 'md' }: TeamFlagProps) {
  const { img, text } = sizes[size]

  return (
    <div className="flex flex-col items-center gap-1">
      <img
        src={flagUrl}
        alt={`Bandeira ${name}`}
        className={`${img} rounded object-cover shadow-sm`}
        loading="lazy"
      />
      <span className={`${text} font-semibold text-[var(--text)] text-center leading-tight`}>
        {name}
      </span>
    </div>
  )
}
