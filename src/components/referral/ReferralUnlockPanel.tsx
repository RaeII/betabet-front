import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ReferralUnlockPanelProps {
  featureName: string
  referralCount: number
  referralCode?: string | null
  groupInviteCode?: string | null
  requiredCount?: number
  className?: string
}

interface ShareLinkRowProps {
  label: string
  value: string
}

function getOrigin() {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

function pluralizeIndication(count: number) {
  return count === 1 ? 'indicação' : 'indicações'
}

function buildUserReferralLink(referralCode?: string | null) {
  if (!referralCode) return ''
  const origin = getOrigin()
  return `${origin}/auth/register?ref=${encodeURIComponent(referralCode)}`
}

function buildGroupReferralLink(groupInviteCode?: string | null, referralCode?: string | null) {
  if (!groupInviteCode) return ''
  const origin = getOrigin()
  const path = `${origin}/invite/${encodeURIComponent(groupInviteCode)}`
  if (!referralCode) return path
  return `${path}?ref=${encodeURIComponent(referralCode)}`
}

function ShareLinkRow({ label, value }: ShareLinkRowProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-[var(--text)]">{label}</p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={value}
          className="min-w-0 flex-1 truncate rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-muted)]"
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={copyLink}
          aria-label={`Copiar ${label.toLowerCase()}`}
        >
          {copied ? <Check aria-hidden="true" size={16} className="text-[var(--success)]" /> : <Copy aria-hidden="true" size={16} />}
        </Button>
      </div>
    </div>
  )
}

export function ReferralUnlockPanel({
  featureName,
  referralCount,
  referralCode,
  groupInviteCode,
  requiredCount = 3,
  className,
}: ReferralUnlockPanelProps) {
  const count = Math.max(0, referralCount)
  const missing = Math.max(requiredCount - count, 0)
  const progress = Math.min((count / requiredCount) * 100, 100)
  const userReferralLink = buildUserReferralLink(referralCode)
  const groupReferralLink = buildGroupReferralLink(groupInviteCode, referralCode)

  return (
    <section
      className={cn(
        'space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-left',
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--text)]">Indicações necessárias</p>
        <p className="text-sm leading-5 text-[var(--text-muted)]">
          Faltam apenas {missing} {pluralizeIndication(missing)} para liberar {featureName}.
        </p>
      </div>

      <div className="space-y-2" aria-label="Progresso de indicações">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
          <span>{Math.min(count, requiredCount)} de {requiredCount} indicações</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {userReferralLink ? (
          <ShareLinkRow label="Seu link de indicação" value={userReferralLink} />
        ) : null}
        {groupReferralLink ? (
          <ShareLinkRow label="Convite do grupo com seu código" value={groupReferralLink} />
        ) : null}
      </div>
    </section>
  )
}
