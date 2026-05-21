import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TeamPreview } from '@/types/import.types'

interface Props {
  team: TeamPreview
  onSave: (apiTeamId: number) => void
  isSaving: boolean
}

export function TeamPreviewRow({ team, onSave, isSaving }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="flex items-center gap-3">
        <img
          src={team.flagUrl}
          alt={`Bandeira de ${team.country}`}
          className="h-6 w-8 rounded-sm object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">{team.name}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {team.country}
            {team.groupLetter ? ` · Grupo ${team.groupLetter}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {team.exists ? (
          <Badge variant="success">Já importado</Badge>
        ) : (
          <Badge>Nova</Badge>
        )}

        <Button
          size="sm"
          variant="secondary"
          disabled={team.exists || isSaving}
          onClick={() => onSave(team.apiTeamId)}
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
          Salvar
        </Button>
      </div>
    </div>
  )
}
