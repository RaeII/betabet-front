import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { resolveInviteCode, joinGroup } from '@/services/groups.service'

export function InvitePage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invite', code],
    queryFn: () => resolveInviteCode(code!),
    enabled: !!code,
  })

  async function handleJoin() {
    if (!isAuthenticated) {
      navigate(`/auth/register?ref=${code}`)
      return
    }
    if (!data?.group || !code) return
    await joinGroup(data.group.id, code)
    navigate(`/groups/${data.group.id}`)
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-[var(--text-muted)]">Carregando convite…</div>
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-[var(--danger)]">Convite inválido ou expirado.</p>
        <Button onClick={() => navigate('/')}>Ir para o início</Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <span className="text-5xl">🏆</span>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Você foi convidado!</h1>
          <p className="mt-1 text-[var(--text-muted)]">Para entrar no grupo</p>
          <p className="mt-2 text-xl font-semibold text-[var(--text)]">{data.group.name}</p>
          <p className="text-sm text-[var(--text-muted)]">{data.group.memberCount} membros</p>
        </div>
        <Button onClick={handleJoin} className="w-full">
          {isAuthenticated ? 'Entrar no grupo' : 'Cadastre-se e entre'}
        </Button>
      </div>
    </div>
  )
}
