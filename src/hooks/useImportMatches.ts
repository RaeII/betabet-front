import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMatchesPreview,
  importAllMatches,
  importMatch,
} from '@/services/import.service'
import { useToast } from '@/context/toast.context'
import type { MatchPreview } from '@/types/import.types'

const PREVIEW_KEY = ['admin', 'import', 'matches', 'preview'] as const
const STATUS_KEY = ['admin', 'import', 'status'] as const

export function useImportMatches() {
  const qc = useQueryClient()
  const toast = useToast()

  const preview = useQuery({
    queryKey: PREVIEW_KEY,
    queryFn: getMatchesPreview,
    enabled: false,
  })

  const newCount = preview.data?.matches.filter(m => !m.exists).length ?? 0

  const saveOne = useMutation({
    mutationFn: (apiFixtureId: number) => importMatch(apiFixtureId),
    onSuccess: (_, apiFixtureId) => {
      qc.setQueryData(PREVIEW_KEY, (old: { matches: MatchPreview[] } | undefined) =>
        old
          ? { matches: old.matches.map(m => m.apiFixtureId === apiFixtureId ? { ...m, exists: true } : m) }
          : old,
      )
      void qc.invalidateQueries({ queryKey: STATUS_KEY })
      toast({ title: 'Partida importada com sucesso', variant: 'success' })
    },
    onError: (err: unknown) => {
      const code = (err as { code?: string })?.code
      if (code === 'TEAMS_MISSING') {
        toast({ title: 'Times não importados. Importe as seleções primeiro.', variant: 'error' })
      } else {
        toast({ title: 'Erro ao importar partida. Tente novamente.', variant: 'error' })
      }
    },
  })

  const saveAll = useMutation({
    mutationFn: importAllMatches,
    onSuccess: result => {
      void qc.invalidateQueries({ queryKey: PREVIEW_KEY })
      void qc.invalidateQueries({ queryKey: STATUS_KEY })
      if (result.created === 0) {
        toast({ title: 'Nenhuma partida nova para importar — todas já estão cadastradas ou dependem de seleções ausentes.' })
      } else {
        toast({
          title: `${result.created} partida(s) importada(s), ${result.skipped} ignorada(s)`,
          variant: 'success',
        })
      }
    },
    onError: () => {
      toast({ title: 'Erro ao importar partidas. Tente novamente.', variant: 'error' })
    },
  })

  return { preview, newCount, saveOne, saveAll }
}
