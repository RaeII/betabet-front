import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReferralInfo } from '@/hooks/useReferral'

export function ReferralSection() {
  const { data, isLoading } = useReferralInfo()
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    if (!data?.link) return
    await navigator.clipboard.writeText(data.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
    </div>
  )
}
