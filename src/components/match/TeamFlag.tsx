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

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 3'%3E%3Crect width='5' height='3' fill='%23e5e7eb'/%3E%3C/svg%3E"

export function TeamFlag({ name, flagUrl, size = 'md' }: TeamFlagProps) {
  const { img, text } = sizes[size]
  const src = flagUrl || PLACEHOLDER

  return (
    <div className="flex flex-col items-center gap-1">
      <img
        src={src}
        alt={`Bandeira ${name}`}
        className={`${img} rounded object-contain shadow-sm`}
        loading="lazy"
      />
      <span className={`${text} font-semibold text-[var(--text)] text-center leading-tight`}>
        {name}
      </span>
    </div>
  )
}
