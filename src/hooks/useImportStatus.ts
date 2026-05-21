import { useQuery } from '@tanstack/react-query'
import { getImportStatus } from '@/services/import.service'

export function useImportStatus() {
  return useQuery({
    queryKey: ['admin', 'import', 'status'],
    queryFn: getImportStatus,
    staleTime: 60_000,
  })
}
