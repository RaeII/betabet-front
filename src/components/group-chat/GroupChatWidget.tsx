import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useActiveGroup } from '@/hooks/useActiveGroup'
import { useGroupChat } from '@/hooks/useGroupChat'
import { GroupChatPanel } from './GroupChatPanel'

export function GroupChatWidget() {
  const { groupId: routeGroupId } = useParams<{ groupId: string }>()
  const { group } = useActiveGroup()
  const [open, setOpen] = useState(false)
  const chatEnabled = Boolean(group?.chatEnabled)
  const chat = useGroupChat(routeGroupId && chatEnabled ? routeGroupId : null, open && chatEnabled)

  if (!routeGroupId || !chatEnabled) return null

  const unreadCount = chat.state.unreadCount

  return (
    <>
      <button
        type="button"
        aria-label="Abrir chat do bolão"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--brand)] text-[var(--brand-text)] shadow-xl transition hover:scale-[1.03] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--support)] lg:bottom-6 lg:right-6"
      >
        <MessageCircle aria-hidden="true" size={24} />
        {unreadCount > 0 ? (
          <span
            className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--danger)] px-1.5 text-center text-[11px] font-bold leading-none text-white"
            aria-label={`${unreadCount} mensagens não lidas`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      <GroupChatPanel
        open={open}
        onClose={() => setOpen(false)}
        groupName={group?.name ?? 'Bolão'}
        chat={chat}
      />
    </>
  )
}
