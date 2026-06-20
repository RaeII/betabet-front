import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import EmojiPicker, { Categories, EmojiStyle, SkinTones, Theme } from 'emoji-picker-react'
import type { EmojiClickData } from 'emoji-picker-react'
import { Bell, Loader2, Send, Smile, WifiOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { cn } from '@/lib/utils'
import type { useGroupChat } from '@/hooks/useGroupChat'
import { useGroupMembers } from '@/hooks/useGroups'
import { useGroupRanking } from '@/hooks/useRanking'
import {
  GROUP_CHAT_MESSAGE_MAX_LENGTH,
  GROUP_CHAT_MESSAGE_MAX_LINES,
  countGroupChatMessageLines,
} from '@/types/group-chat.types'
import type { GroupChatMention, GroupChatMessage } from '@/types/group-chat.types'
import type { GroupMembership } from '@/types/group.types'
import {
  dedupeSelectedMentions,
  filterMentionMembers,
  findActiveMentionToken,
  getMentionedUserIds,
  getVisibleSelectedMentions,
  insertMentionText,
} from './groupChatMention.utils'
import type { SelectedChatMention } from './groupChatMention.utils'

type GroupChatHook = ReturnType<typeof useGroupChat>
const GROUP_CHAT_MESSAGE_WARNING_LENGTH = Math.floor(GROUP_CHAT_MESSAGE_MAX_LENGTH * 0.9)
const GROUP_CHAT_COMPOSER_MAX_HEIGHT = 144
const GROUP_CHAT_EMOJI_PICKER_CATEGORIES = [
  { category: Categories.SUGGESTED, name: 'Recentes' },
  { category: Categories.SMILEYS_PEOPLE, name: 'Rostos e pessoas' },
  { category: Categories.ANIMALS_NATURE, name: 'Animais e natureza' },
  { category: Categories.FOOD_DRINK, name: 'Comidas e bebidas' },
  { category: Categories.TRAVEL_PLACES, name: 'Viagens e lugares' },
  { category: Categories.ACTIVITIES, name: 'Atividades' },
  { category: Categories.OBJECTS, name: 'Objetos' },
  { category: Categories.SYMBOLS, name: 'Símbolos' },
  { category: Categories.FLAGS, name: 'Bandeiras' },
]
const GROUP_CHAT_EMOJI_SKIN_TONES = [
  { value: SkinTones.NEUTRAL, label: 'Tom padrão', color: '#ffd225' },
  { value: SkinTones.LIGHT, label: 'Tom claro', color: '#ffdfbd' },
  { value: SkinTones.MEDIUM_LIGHT, label: 'Tom médio claro', color: '#e9c197' },
  { value: SkinTones.MEDIUM, label: 'Tom médio', color: '#c88e62' },
  { value: SkinTones.MEDIUM_DARK, label: 'Tom médio escuro', color: '#a86637' },
  { value: SkinTones.DARK, label: 'Tom escuro', color: '#60463a' },
] as const
const GROUP_CHAT_EMOJI_PICKER_STYLE = {
  '--epr-bg-color': 'var(--surface)',
  '--epr-text-color': 'var(--text)',
  '--epr-picker-border-color': 'var(--border)',
  '--epr-highlight-color': 'var(--brand)',
  '--epr-hover-bg-color': 'var(--surface-soft)',
  '--epr-focus-bg-color': 'var(--surface-soft)',
  '--epr-search-input-bg-color': 'var(--surface-soft)',
  '--epr-search-input-bg-color-active': 'var(--surface-soft)',
  '--epr-search-input-text-color': 'var(--text)',
  '--epr-search-input-placeholder-color': 'var(--text-muted)',
  '--epr-search-border-color': 'var(--border)',
  '--epr-search-border-color-active': 'var(--border)',
  '--epr-category-label-bg-color': 'transparent',
  '--epr-category-label-text-color': 'transparent',
  '--epr-category-icon-active-color': 'var(--brand)',
  '--epr-picker-border-radius': '10px',
  '--epr-horizontal-padding': '8px',
  '--epr-header-padding': '8px',
  '--epr-search-input-height': '34px',
  '--epr-category-navigation-button-size': '23px',
  '--epr-category-label-height': '0px',
  '--epr-category-label-padding': '0',
  '--epr-emoji-size': '24px',
  '--epr-emoji-padding': '4px',
} as CSSProperties

interface GroupChatPanelProps {
  open: boolean
  onClose: () => void
  groupId: string
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

function resizeComposerInput(element: HTMLTextAreaElement) {
  element.style.height = 'auto'
  const nextHeight = Math.min(element.scrollHeight, GROUP_CHAT_COMPOSER_MAX_HEIGHT)
  element.style.height = `${nextHeight}px`
  element.style.overflowY =
    element.scrollHeight > GROUP_CHAT_COMPOSER_MAX_HEIGHT ? 'auto' : 'hidden'
}

function messageMentionsUser(message: GroupChatMessage, userId: string | undefined) {
  return Boolean(userId && (message.mentions ?? []).some(mention => mention.userId === userId))
}

function renderMessageBody(body: string, mentions: GroupChatMention[], isOnBrand = false) {
  if (mentions.length === 0) return body

  const tokens = mentions.map(mention => `@${mention.displayText}`).filter(Boolean)
  const nodes: ReactNode[] = []
  let cursor = 0
  let key = 0

  while (cursor < body.length) {
    let nextIndex = -1
    let nextToken = ''

    for (const token of tokens) {
      const index = body.indexOf(token, cursor)
      if (index !== -1 && (nextIndex === -1 || index < nextIndex)) {
        nextIndex = index
        nextToken = token
      }
    }

    if (nextIndex === -1) {
      nodes.push(body.slice(cursor))
      break
    }

    if (nextIndex > cursor) nodes.push(body.slice(cursor, nextIndex))
    nodes.push(
      <span
        key={`mention-${key}`}
        className={cn(
          'font-bold underline decoration-current/35 underline-offset-2',
          isOnBrand
            ? 'text-[color-mix(in_srgb,var(--brand-text)_88%,var(--surface))]'
            : 'text-[color-mix(in_srgb,var(--brand)_82%,var(--text))]',
        )}
      >
        {nextToken}
      </span>,
    )
    key += 1
    cursor = nextIndex + nextToken.length
  }

  return nodes
}

function renderComposerMirrorBody(body: string, mentions: SelectedChatMention[]) {
  if (body.length === 0) return null

  const tokens = dedupeSelectedMentions(mentions)
    .map(mention => `@${mention.displayText}`)
    .filter(token => body.includes(token))

  if (tokens.length === 0) return body

  const nodes: ReactNode[] = []
  let cursor = 0
  let key = 0

  while (cursor < body.length) {
    let nextIndex = -1
    let nextToken = ''

    for (const token of tokens) {
      const index = body.indexOf(token, cursor)
      if (
        index !== -1 &&
        (nextIndex === -1 || index < nextIndex || (index === nextIndex && token.length > nextToken.length))
      ) {
        nextIndex = index
        nextToken = token
      }
    }

    if (nextIndex === -1) {
      nodes.push(body.slice(cursor))
      break
    }

    if (nextIndex > cursor) nodes.push(body.slice(cursor, nextIndex))
    nodes.push(
      <span
        key={`composer-mention-${key}`}
        data-group-chat-composer-mention="true"
        className="rounded-[3px] bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] shadow-[0_1px_0_0_color-mix(in_srgb,var(--brand)_52%,transparent)]"
      >
        {nextToken}
      </span>,
    )
    key += 1
    cursor = nextIndex + nextToken.length
  }

  return nodes
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

function ChatPushNotificationCta() {
  const push = usePushNotifications()
  if (!push.canEnable) return null

  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="min-h-9 w-full justify-center rounded-full"
        disabled={push.busy}
        onClick={() => {
          void push.enable()
        }}
      >
        {push.busy ? (
          <Loader2 aria-hidden="true" size={15} className="animate-spin" />
        ) : (
          <Bell aria-hidden="true" size={15} />
        )}
        Ativar notificações do chat
      </Button>
      {push.error ? (
        <p className="mt-2 text-center text-xs text-[var(--danger)]">{push.error}</p>
      ) : null}
    </div>
  )
}

function MessageAuthor({
  name,
  isMine,
  position,
  isLeader,
}: {
  name: string
  isMine: boolean
  position: number | null
  isLeader: boolean
}) {
  const displayName = isMine ? 'você' : name

  return (
    <p
      className={cn(
        'flex max-w-full items-center gap-1.5 px-1 text-xs font-semibold',
        isMine ? 'justify-end text-right' : 'justify-start',
        isLeader ? 'text-[var(--support)]' : 'text-[var(--text-muted)]',
      )}
    >
      <span className="min-w-0 truncate">{displayName}</span>
      {position !== null ? (
        <span
          className={cn(
            'inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-extrabold leading-none tabular-nums',
            isLeader
              ? 'border border-[color-mix(in_srgb,var(--support)_48%,var(--border))] bg-[color-mix(in_srgb,var(--support)_16%,transparent)] text-[var(--support)]'
              : 'border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]',
          )}
          aria-label={`Posição ${position} no ranking`}
        >
          {position}°
        </span>
      ) : null}
      {isLeader ? (
        <span
          role="img"
          aria-label="Primeiro lugar"
          className="shrink-0 text-[13px] leading-none"
        >
          👑
        </span>
      ) : null}
    </p>
  )
}

function MessageRow({
  message,
  isMine,
  showAuthor,
  isGroupedWithPrevious,
  position,
  isLeader,
  currentUserId,
}: {
  message: GroupChatMessage
  isMine: boolean
  showAuthor: boolean
  isGroupedWithPrevious: boolean
  position: number | null
  isLeader: boolean
  currentUserId: string | undefined
}) {
  const mentions = message.mentions ?? []
  const mentionsMe = messageMentionsUser(message, currentUserId)

  return (
    <div
      id={`group-chat-message-${message.id}`}
      className={cn(
        'flex gap-2',
        isMine ? 'justify-end' : 'justify-start',
        isGroupedWithPrevious && '-mt-2',
      )}
    >
      {!isMine ? (
        showAuthor ? (
          <MessageAvatar message={message} />
        ) : (
          <span className="h-8 w-8 shrink-0" aria-hidden="true" />
        )
      ) : null}
      <div
        className={cn(
          'flex max-w-[82%] flex-col space-y-1',
          isMine ? 'items-end' : 'items-start',
        )}
      >
        {showAuthor ? (
          <MessageAuthor
            name={message.user.name}
            isMine={isMine}
            position={position}
            isLeader={isLeader}
          />
        ) : null}
        <div
          className={cn(
            'max-w-full rounded-[var(--radius-sm)] border px-3.5 py-2 text-sm leading-relaxed shadow-sm',
            mentionsMe
              ? 'rounded-bl-[4px] border-[var(--border)] border-l-4 border-l-[color-mix(in_srgb,var(--brand)_70%,var(--border))] bg-[var(--surface)] text-[var(--text)]'
              : isMine
              ? 'rounded-br-[4px] border-[color-mix(in_srgb,var(--brand)_78%,var(--border))] bg-[var(--brand)] text-[var(--brand-text)]'
              : 'rounded-bl-[4px] border-[var(--border)] bg-[var(--surface)] text-[var(--text)]',
          )}
        >
          {mentionsMe ? (
            <p className="mb-1 text-[11px] font-semibold text-[color-mix(in_srgb,var(--brand)_76%,var(--text))]">
              Mencionou você
            </p>
          ) : null}
          <p className="whitespace-pre-wrap break-words">
            {renderMessageBody(message.body, mentions, isMine && !mentionsMe)}
          </p>
          <p
            className={cn(
              'mt-1.5 text-right text-[10px] font-medium tabular-nums',
              isMine && !mentionsMe
                ? 'text-[color-mix(in_srgb,var(--brand-text)_70%,transparent)]'
                : 'text-[var(--text-muted)]',
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
  members,
  currentUserId,
  onSend,
}: {
  disabled: boolean
  isSending: boolean
  members: GroupMembership[]
  currentUserId: string | undefined
  onSend: (body: string, mentionedUserIds: string[]) => Promise<boolean>
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const mirrorRef = useRef<HTMLDivElement | null>(null)
  const emojiPickerRef = useRef<HTMLDivElement | null>(null)
  const [body, setBody] = useState('')
  const [caretPosition, setCaretPosition] = useState(0)
  const [selectedMentions, setSelectedMentions] = useState<SelectedChatMention[]>([])
  const [mentionPickerOpen, setMentionPickerOpen] = useState(false)
  const [activeMentionIndex, setActiveMentionIndex] = useState(0)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [selectedSkinTone, setSelectedSkinTone] = useState<SkinTones>(SkinTones.NEUTRAL)
  const trimmedLength = body.trim().length
  const lineCount = countGroupChatMessageLines(body)
  const tooLong = trimmedLength > GROUP_CHAT_MESSAGE_MAX_LENGTH
  const tooManyLines = lineCount > GROUP_CHAT_MESSAGE_MAX_LINES
  const canSend = trimmedLength > 0 && !tooLong && !tooManyLines && !disabled && !isSending
  const activeMention = useMemo(
    () => findActiveMentionToken(body, caretPosition),
    [body, caretPosition],
  )
  const visibleSelectedMentions = useMemo(
    () => getVisibleSelectedMentions(body, selectedMentions),
    [body, selectedMentions],
  )
  const hasVisibleMentions = visibleSelectedMentions.length > 0
  const mentionSuggestions = useMemo(() => {
    if (!activeMention) return []
    const selectedUserIds = new Set(visibleSelectedMentions.map(mention => mention.userId))
    return filterMentionMembers(members, activeMention.query, currentUserId)
      .filter(member => !selectedUserIds.has(member.user.id))
  }, [activeMention, currentUserId, members, visibleSelectedMentions])
  const showMentionPicker = mentionPickerOpen && Boolean(activeMention) && mentionSuggestions.length > 0

  const focusComposerAt = useCallback((position: number) => {
    window.requestAnimationFrame(() => {
      const element = inputRef.current
      if (!element) return
      element.focus()
      element.setSelectionRange(position, position)
    })
  }, [])

  useLayoutEffect(() => {
    const element = inputRef.current
    if (element) resizeComposerInput(element)
  }, [body])

  useEffect(() => {
    setActiveMentionIndex(0)
  }, [activeMention?.query, mentionSuggestions.length])

  useEffect(() => {
    if (!disabled) return
    setEmojiPickerOpen(false)
  }, [disabled])

  useEffect(() => {
    if (!emojiPickerOpen) return

    function handleDocumentPointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node) || emojiPickerRef.current?.contains(target)) return
      setEmojiPickerOpen(false)
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setEmojiPickerOpen(false)
      focusComposerAt(caretPosition)
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)
    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [caretPosition, emojiPickerOpen, focusComposerAt])

  function updateBody(nextBody: string, nextCaretPosition: number) {
    const nextActiveMention = findActiveMentionToken(nextBody, nextCaretPosition)
    setBody(nextBody)
    setCaretPosition(nextCaretPosition)
    setSelectedMentions(prev => getVisibleSelectedMentions(nextBody, prev))
    setMentionPickerOpen(Boolean(nextActiveMention))
    if (nextActiveMention) {
      setEmojiPickerOpen(false)
    }
  }

  function syncMirrorScroll(element: HTMLTextAreaElement) {
    if (!mirrorRef.current) return
    mirrorRef.current.scrollTop = element.scrollTop
    mirrorRef.current.scrollLeft = element.scrollLeft
  }

  function selectMention(member: GroupMembership) {
    if (!activeMention) return
    const inserted = insertMentionText(body, activeMention, member.user.name)
    setBody(inserted.value)
    setCaretPosition(inserted.caretPosition)
    setSelectedMentions(prev =>
      dedupeSelectedMentions([
        ...getVisibleSelectedMentions(inserted.value, prev),
        { userId: member.user.id, displayText: member.user.name },
      ]),
    )
    setMentionPickerOpen(false)
    focusComposerAt(inserted.caretPosition)
  }

  function insertEmoji(emojiData: EmojiClickData) {
    const element = inputRef.current
    const selectionStart = element?.selectionStart ?? caretPosition
    const selectionEnd = element?.selectionEnd ?? caretPosition
    const nextBody = `${body.slice(0, selectionStart)}${emojiData.emoji}${body.slice(selectionEnd)}`
    const nextCaretPosition = selectionStart + emojiData.emoji.length

    updateBody(nextBody, nextCaretPosition)
    setMentionPickerOpen(false)
    focusComposerAt(nextCaretPosition)
  }

  async function submit() {
    if (!canSend) return
    const nextBody = body
    const sent = await onSend(nextBody, getMentionedUserIds(nextBody, selectedMentions))
    if (sent) {
      setBody('')
      setCaretPosition(0)
      setSelectedMentions([])
      setMentionPickerOpen(false)
      setEmojiPickerOpen(false)
    }
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-end gap-2">
        <div ref={emojiPickerRef} className="relative shrink-0">
          {emojiPickerOpen ? (
            <div className="group-chat-emoji-popover absolute bottom-full left-0 z-20 mb-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
              <div className="flex min-h-10 items-center justify-between gap-2 border-b border-[var(--border)] px-2 py-1.5">
                <div
                  role="group"
                  aria-label="Tom dos emojis"
                  className="flex min-w-0 flex-1 items-center gap-1"
                >
                  {GROUP_CHAT_EMOJI_SKIN_TONES.map(skinTone => {
                    const selected = selectedSkinTone === skinTone.value

                    return (
                      <button
                        key={skinTone.value}
                        type="button"
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => setSelectedSkinTone(skinTone.value)}
                        aria-label={skinTone.label}
                        aria-pressed={selected}
                        className={cn(
                          'relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--surface-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]',
                          selected && 'bg-[var(--surface-soft)]',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="h-4 w-4 rounded-[4px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.24)]"
                          style={{ backgroundColor: skinTone.color }}
                        />
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute bottom-0.5 h-1 w-1 rounded-full bg-[var(--brand)] transition-opacity',
                            selected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    setEmojiPickerOpen(false)
                    focusComposerAt(caretPosition)
                  }}
                  aria-label="Fechar emojis"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
                >
                  <X aria-hidden="true" size={14} />
                </button>
              </div>
              <EmojiPicker
                key={selectedSkinTone}
                className="group-chat-emoji-picker"
                width="100%"
                height="min(17.5rem, calc(100vh - 13rem))"
                lazyLoadEmojis
                autoFocusSearch={false}
                emojiStyle={EmojiStyle.NATIVE}
                theme={Theme.AUTO}
                categories={GROUP_CHAT_EMOJI_PICKER_CATEGORIES}
                defaultSkinTone={selectedSkinTone}
                skinTonesDisabled
                searchPlaceholder="Buscar emoji"
                searchClearButtonLabel="Limpar busca"
                previewConfig={{ showPreview: false }}
                style={GROUP_CHAT_EMOJI_PICKER_STYLE}
                onEmojiClick={insertEmoji}
              />
            </div>
          ) : null}
          <button
            type="button"
            disabled={disabled}
            onMouseDown={event => event.preventDefault()}
            onClick={() => {
              setMentionPickerOpen(false)
              setEmojiPickerOpen(open => !open)
            }}
            aria-label={emojiPickerOpen ? 'Fechar emojis' : 'Abrir emojis'}
            aria-expanded={emojiPickerOpen}
            className={cn(
              'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--brand)]',
              emojiPickerOpen
                ? 'bg-[color-mix(in_srgb,var(--brand)_12%,var(--surface-soft))] text-[var(--brand)]'
                : 'bg-[var(--surface-soft)] hover:text-[var(--text)]',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <Smile aria-hidden="true" size={19} />
          </button>
        </div>
        <div
          className={cn(
            'relative flex-1 rounded-[var(--radius-lg)] border bg-[var(--surface-soft)] transition focus-within:border-[var(--brand)]',
            hasVisibleMentions
              ? 'border-[color-mix(in_srgb,var(--brand)_48%,var(--border))] ring-1 ring-[color-mix(in_srgb,var(--brand)_16%,transparent)]'
              : 'border-[var(--border)]',
          )}
          data-has-mentions={hasVisibleMentions}
        >
          {showMentionPicker ? (
            <div className="absolute bottom-full left-0 right-0 z-10 mb-2 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-xl">
              {mentionSuggestions.map((member, index) => (
                <button
                  key={member.user.id}
                  type="button"
                  onMouseDown={event => {
                    event.preventDefault()
                    selectMention(member)
                  }}
                  aria-label={`Mencionar ${member.user.name}`}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text)] transition',
                    index === activeMentionIndex
                      ? 'bg-[color-mix(in_srgb,var(--brand)_10%,var(--surface-soft))]'
                      : 'bg-[var(--surface)] hover:bg-[var(--surface-soft)]',
                  )}
                >
                  {member.user.avatarUrl ? (
                    <img
                      src={member.user.avatarUrl}
                      alt=""
                      className="h-7 w-7 shrink-0 rounded-full object-cover"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[9px] font-bold text-[var(--brand)]">
                      {initials(member.user.name)}
                    </span>
                  )}
                  <span className="min-w-0 truncate font-semibold">{member.user.name}</span>
                </button>
              ))}
            </div>
          ) : null}
          <div
            ref={mirrorRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-3 text-sm leading-5 text-transparent"
          >
            {renderComposerMirrorBody(body, visibleSelectedMentions)}
          </div>
          <textarea
            ref={inputRef}
            value={body}
            onChange={event => {
              updateBody(event.target.value, event.target.selectionStart)
            }}
            onSelect={event => {
              setCaretPosition(event.currentTarget.selectionStart)
            }}
            onScroll={event => {
              syncMirrorScroll(event.currentTarget)
            }}
            onKeyDown={event => {
              if (showMentionPicker) {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setActiveMentionIndex(index => (index + 1) % mentionSuggestions.length)
                  return
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setActiveMentionIndex(index => (
                    index - 1 + mentionSuggestions.length
                  ) % mentionSuggestions.length)
                  return
                }
                if (event.key === 'Enter' || event.key === 'Tab') {
                  event.preventDefault()
                  const suggestion = mentionSuggestions[activeMentionIndex] ?? mentionSuggestions[0]
                  if (suggestion) selectMention(suggestion)
                  return
                }
                if (event.key === 'Escape') {
                  event.preventDefault()
                  setMentionPickerOpen(false)
                  return
                }
              }

              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void submit()
              } else if (event.key === 'Enter' && lineCount >= GROUP_CHAT_MESSAGE_MAX_LINES) {
                event.preventDefault()
              }
            }}
            rows={1}
            maxLength={GROUP_CHAT_MESSAGE_MAX_LENGTH}
            placeholder="Mensagem"
            aria-label="Mensagem do chat"
            className="group-chat-composer-input relative z-[1] max-h-36 min-h-11 w-full resize-none overflow-y-hidden border-0 bg-transparent px-4 py-3 text-sm leading-5 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
        </div>
        <Button
          type="button"
          size="icon"
          onClick={() => void submit()}
          disabled={!canSend}
          aria-label="Enviar mensagem"
          className="h-11 min-h-11 w-11 min-w-11 shrink-0 rounded-full p-0"
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
          A mensagem deve ter no máximo {GROUP_CHAT_MESSAGE_MAX_LENGTH} caracteres.
        </p>
      ) : tooManyLines ? (
        <p className="mt-1 text-xs text-[var(--danger)]">
          A mensagem deve ter no máximo {GROUP_CHAT_MESSAGE_MAX_LINES} linhas.
        </p>
      ) : trimmedLength > GROUP_CHAT_MESSAGE_WARNING_LENGTH ? (
        <p className="mt-1 text-right text-xs text-[var(--text-muted)]">
          {trimmedLength}/{GROUP_CHAT_MESSAGE_MAX_LENGTH}
        </p>
      ) : null}
    </div>
  )
}

export function GroupChatPanel({ open, onClose, groupId, groupName, chat }: GroupChatPanelProps) {
  const { user } = useAuth()
  const { data: rankingData } = useGroupRanking(groupId, open)
  const { data: membersData } = useGroupMembers(groupId, open)
  const listRef = useRef<HTMLDivElement | null>(null)
  const initialScrollDoneRef = useRef(false)
  const loadingOlderRef = useRef(false)
  const [visibleOpen, setVisibleOpen] = useState(open)

  const messages = chat.messages
  const members = membersData?.members ?? []
  const latestMessageId = messages[messages.length - 1]?.id ?? null
  const showReconnect = chat.connectionStatus === 'reconnecting'
  const positionByUserId = useMemo(
    () => new Map((rankingData?.ranking ?? []).map(entry => [entry.userId, entry.position] as const)),
    [rankingData?.ranking],
  )

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
      const startsNewDay = day !== lastDay
      const previous = messages[index - 1]
      const hasUnreadDivider = Boolean(
        chat.state.unreadCount > 0 &&
        chat.state.lastSeenMessageId &&
        previous?.id === chat.state.lastSeenMessageId,
      )
      const showAuthor = startsNewDay || hasUnreadDivider || previous?.userId !== message.userId
      const position = positionByUserId.get(message.userId) ?? null
      const nodes: ReactNode[] = []

      if (startsNewDay) {
        lastDay = day
        nodes.push(
          <div key={`day-${day}`} className="flex justify-center py-2">
            <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)] shadow-sm">
              {formatDay(message.createdAt)}
            </span>
          </div>,
        )
      }

      if (hasUnreadDivider) {
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
          showAuthor={showAuthor}
          isGroupedWithPrevious={!showAuthor}
          position={position}
          isLeader={position === 1}
          currentUserId={user?.id}
        />,
      )
      return nodes
    })
  }, [chat.state.lastSeenMessageId, chat.state.unreadCount, messages, positionByUserId, user?.id])

  if (!visibleOpen) return null

  return (
    <section
      role="dialog"
      aria-label="Chat do bolão"
      aria-hidden={!open}
      className={cn(
        'fixed z-40 flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-2xl transition duration-200',
        'bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 top-[calc(4rem+env(safe-area-inset-top)+0.75rem)] rounded-[var(--radius-xl)]',
        'lg:bottom-24 lg:left-auto lg:right-6 lg:top-auto lg:h-[38rem] lg:w-[26rem]',
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

      <ChatPushNotificationCta />

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
        members={members}
        currentUserId={user?.id}
        onSend={chat.sendMessage}
      />
    </section>
  )
}
