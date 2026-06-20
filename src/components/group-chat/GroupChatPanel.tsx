import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Loader2, Send, WifiOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { useGroupChat } from '@/hooks/useGroupChat'
import type { GroupChatMessage } from '@/types/group-chat.types'

type GroupChatHook = ReturnType<typeof useGroupChat>

interface GroupChatPanelProps {
  open: boolean
  onClose: () => void
  groupName: string
  chat: GroupChatHook
}

function formatDay(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
  }).format(date)
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function isNearBottom(element: HTMLElement) {
  return element.scrollHeight - element.scrollTop - element.clientHeight < 96
}

function MessageAvatar({ message }: { message: GroupChatMessage }) {
  if (message.user.avatarUrl) {
    return (
      <img
        src={message.user.avatarUrl}
        alt=""
        className="h-8 w-8 rounded-full object-cover"
        aria-hidden="true"
      />
    )
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[10px] font-bold text-[var(--brand)]">
      {initials(message.user.name)}
    </span>
  )
}

function MessageRow({
  message,
  isMine,
}: {
  message: GroupChatMessage
  isMine: boolean
}) {
  return (
    <div
      id={`group-chat-message-${message.id}`}
      className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}
    >
      {!isMine ? <MessageAvatar message={message} /> : null}
      <div className={cn('max-w-[78%] space-y-1', isMine && 'items-end')}>
        {!isMine ? (
          <p className="px-1 text-xs font-semibold text-[var(--text-muted)]">
            {message.user.name}
          </p>
        ) : null}
        <div
          className={cn(
            'rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm',
            isMine
              ? 'rounded-br-sm bg-[var(--brand)] text-[var(--brand-text)]'
              : 'rounded-bl-sm border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)]',
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
          <p
            className={cn(
              'mt-1 text-right text-[10px]',
              isMine ? 'text-[color-mix(in_srgb,var(--brand-text)_70%,transparent)]' : 'text-[var(--text-muted)]',
            )}
          >
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}

function ChatComposer({
  disabled,
  isSending,
  onSend,
}: {
  disabled: boolean
  isSending: boolean
  onSend: (body: string) => Promise<boolean>
}) {
  const [body, setBody] = useState('')
  const trimmedLength = body.trim().length
  const tooLong = trimmedLength > 1000
  const canSend = trimmedLength > 0 && !tooLong && !disabled && !isSending

  async function submit() {
    if (!canSend) return
    const nextBody = body
    const sent = await onSend(nextBody)
    if (sent) setBody('')
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-end gap-2">
        <textarea
          value={body}
          onChange={event => setBody(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void submit()
            }
          }}
          rows={1}
          maxLength={1100}
          placeholder="Mensagem"
          aria-label="Mensagem do chat"
          className="max-h-28 min-h-11 flex-1 resize-none rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none"
        />
        <Button
          type="button"
          size="icon"
          onClick={() => void submit()}
          disabled={!canSend}
          aria-label="Enviar mensagem"
          className="h-11 w-11 shrink-0"
        >
          {isSending ? (
            <Loader2 aria-hidden="true" size={18} className="animate-spin" />
          ) : (
            <Send aria-hidden="true" size={18} />
          )}
        </Button>
      </div>
      {tooLong ? (
        <p className="mt-1 text-xs text-[var(--danger)]">
          A mensagem deve ter no máximo 1000 caracteres.
        </p>
      ) : trimmedLength > 900 ? (
        <p className="mt-1 text-right text-xs text-[var(--text-muted)]">
          {trimmedLength}/1000
        </p>
      ) : null}
    </div>
  )
}

export function GroupChatPanel({ open, onClose, groupName, chat }: GroupChatPanelProps) {
  const { user } = useAuth()
  const listRef = useRef<HTMLDivElement | null>(null)
  const initialScrollDoneRef = useRef(false)
  const loadingOlderRef = useRef(false)
  const [visibleOpen, setVisibleOpen] = useState(open)

  const messages = chat.messages
  const latestMessageId = messages[messages.length - 1]?.id ?? null
  const showReconnect = chat.connectionStatus === 'reconnecting'

  useEffect(() => {
    if (open) {
      setVisibleOpen(true)
      initialScrollDoneRef.current = false
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const element = listRef.current
    if (!element || messages.length === 0 || initialScrollDoneRef.current) return

    window.requestAnimationFrame(() => {
      const anchorId = chat.initialAnchorMessageId
      const anchor = anchorId
        ? document.getElementById(`group-chat-message-${anchorId}`)
        : null

      if (anchor) {
        anchor.scrollIntoView({ block: 'start' })
      } else {
        element.scrollTop = element.scrollHeight
      }
      initialScrollDoneRef.current = true
      if (isNearBottom(element) && latestMessageId) {
        void chat.markReadThrough(latestMessageId)
      }
    })
  }, [chat, latestMessageId, messages.length, open])

  useEffect(() => {
    if (!open || !latestMessageId) return
    const element = listRef.current
    if (element && isNearBottom(element)) {
      void chat.markReadThrough(latestMessageId)
    }
  }, [chat, latestMessageId, messages.length, open])

  const renderedMessages = useMemo(() => {
    let lastDay = ''
    return messages.flatMap((message, index) => {
      const day = new Date(message.createdAt).toDateString()
    const nodes: ReactNode[] = []
      if (day !== lastDay) {
        lastDay = day
        nodes.push(
          <div key={`day-${day}`} className="flex justify-center py-2">
            <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)] shadow-sm">
              {formatDay(message.createdAt)}
            </span>
          </div>,
        )
      }

      const previous = messages[index - 1]
      if (
        chat.state.unreadCount > 0 &&
        chat.state.lastSeenMessageId &&
        previous?.id === chat.state.lastSeenMessageId
      ) {
        nodes.push(
          <div key={`unread-${message.id}`} className="flex items-center gap-3 py-2">
            <span className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              Novas mensagens
            </span>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>,
        )
      }

      nodes.push(
        <MessageRow
          key={message.id}
          message={message}
          isMine={message.userId === user?.id}
        />,
      )
      return nodes
    })
  }, [chat.state.lastSeenMessageId, chat.state.unreadCount, messages, user?.id])

  if (!visibleOpen) return null

  return (
    <section
      role="dialog"
      aria-label="Chat do bolão"
      aria-hidden={!open}
      className={cn(
        'fixed z-40 flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-2xl transition duration-200',
        'bottom-0 left-0 right-0 h-[min(82vh,42rem)] rounded-t-[var(--radius-xl)]',
        'lg:bottom-24 lg:left-auto lg:right-6 lg:h-[38rem] lg:w-[26rem] lg:rounded-[var(--radius-xl)]',
        open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
      onTransitionEnd={() => {
        if (!open) setVisibleOpen(false)
      }}
    >
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-4">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-[var(--text)]">{groupName}</h2>
          <p className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            {showReconnect ? (
              <>
                <WifiOff aria-hidden="true" size={13} />
                Reconectando
              </>
            ) : (
              'Chat do bolão'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar chat"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:text-[var(--text)] focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-[var(--brand)]"
        >
          <X aria-hidden="true" size={16} />
        </button>
      </header>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[var(--surface-soft)] px-3 py-4"
        onScroll={event => {
          const element = event.currentTarget
          if (element.scrollTop <= 48 && chat.hasMoreBefore && !loadingOlderRef.current) {
            loadingOlderRef.current = true
            const previousHeight = element.scrollHeight
            const previousTop = element.scrollTop
            void chat.loadOlder().then(loaded => {
              window.requestAnimationFrame(() => {
                if (loaded) {
                  element.scrollTop = element.scrollHeight - previousHeight + previousTop
                }
                loadingOlderRef.current = false
              })
            })
          }

          if (latestMessageId && isNearBottom(element)) {
            void chat.markReadThrough(latestMessageId)
          }
        }}
      >
        {chat.isLoadingOlder ? (
          <div className="flex justify-center py-2 text-xs text-[var(--text-muted)]">
            Carregando mensagens antigas…
          </div>
        ) : null}

        {chat.isLoadingInitial ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
            Carregando chat…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm text-[var(--text-muted)]">
            Nenhuma mensagem ainda.
          </div>
        ) : (
          renderedMessages
        )}
      </div>

      {chat.error ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-[var(--danger)]">
          {chat.error}
        </div>
      ) : null}

      <ChatComposer
        disabled={!open}
        isSending={chat.isSending}
        onSend={chat.sendMessage}
      />
    </section>
  )
}
