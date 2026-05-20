import { Badge } from '@/components/ui/badge'
import type { MatchStatus } from '@/types/match.types'

const statusConfig: Record<MatchStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  upcoming: { label: 'Em breve', variant: 'default' },
  live: { label: '● Ao vivo', variant: 'warning' },
  finished: { label: 'Encerrado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
}

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const { label, variant } = statusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}
