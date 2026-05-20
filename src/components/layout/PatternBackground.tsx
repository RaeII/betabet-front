interface PatternBackgroundProps {
  theme: 'light' | 'dark'
}

export function PatternBackground({ theme }: PatternBackgroundProps) {
  const isDark = theme === 'dark'

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/world-cup-pattern.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '220px 220px',
          backgroundPosition: 'top left',
          opacity: isDark ? 0.12 : 0.09,
          filter: isDark ? 'invert(1)' : 'none',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: isDark
            ? 'rgba(15, 17, 16, 0.58)'
            : 'rgba(247, 244, 236, 0.72)',
        }}
      />
    </div>
  )
}
