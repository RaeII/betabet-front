import { useState } from 'react'
import { Check, Copy, Gift, LockKeyhole } from 'lucide-react'
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
  return `${origin}/?ref=${encodeURIComponent(referralCode)}`
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
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[var(--text)]">{label}</p>
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-2">
        <input
          readOnly
          value={value}
          className="min-w-0 flex-1 truncate bg-transparent px-1 text-xs font-medium text-[var(--text-muted)] outline-none"
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
  const required = Math.max(requiredCount, 1)
  const count = Math.max(0, referralCount)
  const completedCount = Math.min(count, required)
  const missing = Math.max(required - count, 0)
  const progress = Math.min((count / required) * 100, 100)
  const isUnlocked = missing === 0
  const inviteTarget = missing === 1 ? 'mais 1 pessoa' : `mais ${missing} pessoas`
  const userReferralLink = buildUserReferralLink(referralCode)
  const groupReferralLink = buildGroupReferralLink(groupInviteCode, referralCode)

  return (
    <section
      className={cn(
        'space-y-5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 text-left',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand)] text-[var(--brand-text)]">
          {isUnlocked ? <Gift aria-hidden="true" size={22} /> : <LockKeyhole aria-hidden="true" size={22} />}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--support)]/40 bg-[var(--support)]/10 px-3 py-1 text-xs font-bold text-[var(--text)]">
              <Gift aria-hidden="true" size={14} />
              Recompensa
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-semibold leading-tight text-[var(--text)]">
              {isUnlocked ? (
                'Recompensa liberada'
              ) : missing === 1 ? (
                <>
                  Falta apenas <span className="text-[var(--brand)]">1</span> indicação
                </>
              ) : (
                <>
                  Faltam apenas <span className="text-[var(--brand)]">{missing}</span> indicações
                </>
              )}
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
              {isUnlocked
                ? `Agora você pode acessar ${featureName} e comparar o que o resto do grupo apostou.`
                : `Convide ${inviteTarget} para desbloquear os palpites dos outros jogadores. Ao completar ${required} ${pluralizeIndication(required)}, você libera ${featureName}.`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2" aria-label="Progresso de indicações">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[var(--text-muted)]">
          <span>Progresso de indicações</span>
          <span className="text-sm text-[var(--text)]">{completedCount}/{required}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text)]">
          Copie seu convite e envie para quem ainda não entrou.
        </p>
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
