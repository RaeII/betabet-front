import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface OnboardingCardProps {
  icon: string
  title: string
  description: string
  to: string
}

export function OnboardingCard({ icon, title, description, to }: OnboardingCardProps) {
  return (
    <Link
      to={to}
      aria-label={title}
      className="flex items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)]"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface-soft)] text-3xl">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">{description}</p>
      </div>
      <ChevronRight size={20} className="shrink-0 text-[var(--text-muted)]" />
    </Link>
  )
}
