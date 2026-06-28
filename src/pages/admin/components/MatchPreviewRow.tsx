import { Loader2 } from 'lucide-react'
import { TeamFlagImage } from '@/components/match/TeamFlagImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatMatchDate } from '@/lib/date.utils'
import type { MatchPreview } from '@/types/import.types'

interface Props {
  match: MatchPreview
  onSave: (apiFixtureId: number) => void
  isSaving: boolean
}

const PHASE_LABELS: Record<string, string> = {
  group: 'Fase de grupos',
  r32: '16-avos de final',
  r16: 'Oitavas de final',
  qf: 'Quartas de final',
  sf: 'Semifinal',
  final: 'Final',
}

function absentTeamNames(match: MatchPreview): string {
  const absent: string[] = []
  if (!match.homeTeam.exists) absent.push(match.homeTeam.name)
  if (!match.awayTeam.exists) absent.push(match.awayTeam.name)
  return absent.join(', ')
}

export function MatchPreviewRow({ match, onSave, isSaving }: Props) {
  const isDisabled = match.exists || !match.teamsImported || isSaving
  const missingTeams = absentTeamNames(match)

  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <TeamFlagImage
              src={match.homeTeam.flagUrl}
              teamId={match.homeTeam.apiTeamId}
              alt={match.homeTeam.country}
              className="h-4 w-6 rounded-sm object-contain"
            />
            <span className="text-sm font-medium text-[var(--text)]">{match.homeTeam.name}</span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">vs</span>
          <div className="flex items-center gap-1.5">
            <TeamFlagImage
              src={match.awayTeam.flagUrl}
              teamId={match.awayTeam.apiTeamId}
              alt={match.awayTeam.country}
              className="h-4 w-6 rounded-sm object-contain"
            />
            <span className="text-sm font-medium text-[var(--text)]">{match.awayTeam.name}</span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          {formatMatchDate(match.scheduledAt)}
          {' · '}
          {PHASE_LABELS[match.phase] ?? match.phase}
          {match.groupName ? ` · ${match.groupName}` : ''}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {match.exists ? (
          <Badge variant="success">Já importada</Badge>
        ) : (
          <Badge>Nova</Badge>
        )}

        {!match.teamsImported && (
          <Badge variant="warning">Times ausentes</Badge>
        )}

        <span title={!match.teamsImported ? `Importe primeiro: ${missingTeams}` : undefined}>
          <Button
            size="sm"
            variant="secondary"
            disabled={isDisabled}
            onClick={() => onSave(match.apiFixtureId)}
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
            Salvar
          </Button>
        </span>
      </div>
    </div>
  )
}
