import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useReferralInfo, useApplyReferralCode } from '@/hooks/useReferral'
import { useAuth } from '@/hooks/useAuth'

export function ReferralSection() {
  const { data, isLoading } = useReferralInfo()
  const { user } = useAuth()
  const applyCode = useApplyReferralCode()
  const [inputCode, setInputCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [applyError, setApplyError] = useState('')

  const codeAlreadySet = !!user?.referredByCode

  async function copyLink() {
    if (!data?.link) return
    await navigator.clipboard.writeText(data.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!inputCode.trim()) return
    setApplyError('')
    applyCode.mutate(inputCode.trim(), {
      onError: () => setApplyError('Código inválido ou já utilizado.'),
    })
  }

  if (isLoading) return null

  const count = data?.count ?? 0
  const NEEDED = 3

  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-base font-semibold text-[var(--text)]">Indicações</h3>

      {/* Share link */}
      <div className="space-y-1">
        <p className="text-sm text-[var(--text-muted)]">Seu link de indicação</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={data?.link ?? ''}
            className="flex-1 truncate rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-muted)]"
          />
          <Button variant="secondary" size="icon" onClick={copyLink}>
            {copied ? <Check size={16} className="text-[var(--success)]" /> : <Copy size={16} />}
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-muted)]">{count} de {NEEDED} indicações</span>
          {data?.isUnlocked ? (
            <span className="font-semibold text-[var(--success)]">✓ Gráfico desbloqueado</span>
          ) : (
            <span className="text-[var(--text-muted)]">Faltam {NEEDED - count}</span>
          )}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
            style={{ width: `${Math.min((count / NEEDED) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Apply referral code */}
      {!codeAlreadySet && (
        <form onSubmit={handleApply} className="space-y-2">
          <p className="text-sm text-[var(--text-muted)]">Código de quem te indicou</p>
          <div className="flex gap-2">
            <Input
              value={inputCode}
              onChange={e => { setInputCode(e.target.value); setApplyError('') }}
              placeholder="Ex: ABC12345"
              disabled={applyCode.isSuccess}
            />
            <Button type="submit" size="sm" disabled={applyCode.isPending || applyCode.isSuccess}>
              {applyCode.isSuccess ? 'Salvo' : 'Aplicar'}
            </Button>
          </div>
          {applyError && <p className="text-xs text-[var(--danger)]">{applyError}</p>}
          {applyCode.isSuccess && (
            <p className="text-xs text-[var(--success)]">Código aplicado com sucesso!</p>
          )}
        </form>
      )}

      {codeAlreadySet && (
        <p className="text-xs text-[var(--text-muted)]">
          Você já foi indicado por alguém. Código não pode ser alterado.
        </p>
      )}
    </div>
  )
}
