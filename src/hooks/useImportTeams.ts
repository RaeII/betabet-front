import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getTeamsPreview,
  importAllTeams,
  importTeam,
} from '@/services/import.service'
import { useToast } from '@/context/toast.context'
import type { TeamPreview } from '@/types/import.types'

const PREVIEW_KEY = ['admin', 'import', 'teams', 'preview'] as const
const STATUS_KEY = ['admin', 'import', 'status'] as const

export function useImportTeams() {
  const qc = useQueryClient()
  const toast = useToast()

  const preview = useQuery({
    queryKey: PREVIEW_KEY,
    queryFn: getTeamsPreview,
    enabled: false,
  })

  const newCount = preview.data?.teams.filter(t => !t.exists).length ?? 0

  const saveOne = useMutation({
    mutationFn: (apiTeamId: number) => importTeam(apiTeamId),
    onSuccess: (_, apiTeamId) => {
      qc.setQueryData(PREVIEW_KEY, (old: { teams: TeamPreview[] } | undefined) =>
        old
          ? { teams: old.teams.map(t => t.apiTeamId === apiTeamId ? { ...t, exists: true } : t) }
          : old,
      )
      void qc.invalidateQueries({ queryKey: STATUS_KEY })
      toast({ title: 'Seleção importada com sucesso', variant: 'success' })
    },
    onError: () => {
      toast({ title: 'Erro ao importar seleção. Tente novamente.', variant: 'error' })
    },
  })

  const saveAll = useMutation({
    mutationFn: importAllTeams,
    onSuccess: result => {
      void qc.invalidateQueries({ queryKey: PREVIEW_KEY })
      void qc.invalidateQueries({ queryKey: STATUS_KEY })
      if (result.created === 0) {
        toast({ title: 'Nenhuma seleção nova para importar — todas já estão cadastradas.' })
      } else {
        toast({
          title: `${result.created} seleção(ões) importada(s), ${result.skipped} ignorada(s)`,
          variant: 'success',
        })
      }
    },
    onError: () => {
      toast({ title: 'Erro ao importar seleções. Tente novamente.', variant: 'error' })
    },
  })

  return { preview, newCount, saveOne, saveAll }
}
