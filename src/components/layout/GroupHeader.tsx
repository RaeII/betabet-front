import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { GroupAvatar } from '@/pages/groups/components/GroupAvatar'
import { GroupGearMenu } from './GroupGearMenu'

function buildGroupInviteLink(inviteCode: string, referralCode?: string | null) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const path = `${origin}/invite/${encodeURIComponent(inviteCode)}`
  if (!referralCode) return path
  return `${path}?ref=${encodeURIComponent(referralCode)}`
}

export function GroupHeader() {
  const { group } = useActiveGroup()
  const { user } = useAuth()
  const [shareOpen, setShareOpen] = useState(false)
  const [includeReferral, setIncludeReferral] = useState(true)
  const [copied, setCopied] = useState(false)

  const referralCode = user?.referralCode ?? null
  const selectedReferralCode = includeReferral ? referralCode : null
  const inviteLink = group
    ? buildGroupInviteLink(group.inviteCode, selectedReferralCode)
    : ''

  function openShareModal() {
    setIncludeReferral(true)
    setCopied(false)
    setShareOpen(true)
  }

  async function copyInviteLink() {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <>
      <header
        className="sticky top-0 z-30 border-b border-[var(--border)] pt-[env(safe-area-inset-top)] backdrop-blur-md lg:top-4 md:rounded-[var(--radius-sm)] lg:border lg:border-[var(--border)]"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--surface) 86%, transparent)',
        }}
      >
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {group ? (
              <>
                <GroupAvatar
                  name={group.name}
                  coverUrl={group.coverUrl}
                  emoji={group.emoji}
                  size="sm"
                />
                <h1 className="truncate text-base font-semibold text-[var(--text)] sm:text-lg">
                  {group.name}
                </h1>
              </>
            ) : (
              <span className="text-sm text-[var(--text-muted)]">Carregando…</span>
            )}
          </div>

          {group ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label="Compartilhar link do bolão"
                onClick={openShareModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:text-[var(--text)] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]"
              >
                <Share2 size={16} />
              </button>
              <GroupGearMenu />
            </div>
          ) : null}
        </div>
      </header>

      <Modal
        open={shareOpen}
        onOpenChange={setShareOpen}
        title="Compartilhar bolão"
        description="Copie o convite do bolão para enviar aos participantes."
      >
        <div className="space-y-2 p-5">


          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--text)]">Link do bolão</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteLink}
                className="min-w-0 flex-1 truncate rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-muted)]"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={copyInviteLink}
                aria-label="Copiar link do bolão"
              >
                {copied ? (
                  <Check aria-hidden="true" size={16} className="text-[var(--success)]" />
                ) : (
                  <Copy aria-hidden="true" size={16} />
                )}
              </Button>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius)] p-2 text-sm text-[var(--text)]">
            <input
              type="checkbox"
              checked={Boolean(referralCode && includeReferral)}
              onChange={event => {
                setIncludeReferral(event.target.checked)
                setCopied(false)
              }}
              disabled={!referralCode}
              className="mt-0.5 accent-[var(--brand)]"
            />
            <span className="min-w-0 space-y-1">
              <span className="block font-semibold">Incluir minha indicação</span>
              <span className="block text-xs text-[var(--text-muted)]">
                {referralCode
                  ? `Código ${referralCode}`
                  : 'Código de indicação indisponível'}
              </span>
            </span>
          </label>
        </div>
      </Modal>
    </>
  )
}
