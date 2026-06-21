import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import EmojiPicker, { Categories, EmojiStyle, SkinTones, SuggestionMode, Theme } from 'emoji-picker-react'
import type { EmojiClickData } from 'emoji-picker-react'
import { Bell, Loader2, Send, Smile, WifiOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
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
type PushNotifications = ReturnType<typeof usePushNotifications>
const GROUP_CHAT_MOBILE_SCROLL_LOCK_QUERY = '(max-width: 1023px)'
const GROUP_CHAT_MESSAGE_WARNING_LENGTH = Math.floor(GROUP_CHAT_MESSAGE_MAX_LENGTH * 0.9)
const GROUP_CHAT_COMPOSER_MAX_HEIGHT = 144
const GROUP_CHAT_EMOJI_PICKER_CATEGORIES = [
  { category: Categories.SUGGESTED, name: 'Recentes' },
  { category: Categories.CUSTOM, name: 'Novos' },
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
  // Must be > 0: emoji-picker-react's getLabelHeight() ignores a measured 0 and
  // falls back to 40px, while the real label is 0px tall. That mismatch makes
  // the virtualization scroll-offset drift +40px per category, so emojis in
  // lower categories get culled as you scroll. 1px keeps the label invisible
  // while letting the measured height match the DOM (see .epr-emoji-category-label).
  '--epr-category-label-height': '1px',
  '--epr-category-label-padding': '0',
  '--epr-emoji-size': '24px',
  '--epr-emoji-padding': '4px',
} as CSSProperties
const GROUP_CHAT_APPLE_EMOJI_IMAGE_BASE_URL =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/'
const GROUP_CHAT_NOTO_EMOJI_IMAGE_BASE_URL =
  'https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@8998f5dd683424a73e2314a8c1f1e359c19e8742/png/128/'
const GROUP_CHAT_LATEST_EMOJIS = [
  {
    id: '1fae9',
    names: ['face with bags under eyes', 'cansado', 'sono', 'exausto'],
    imgUrl: `${GROUP_CHAT_APPLE_EMOJI_IMAGE_BASE_URL}1fae9.png`,
  },
  {
    id: '1fac6',
    names: ['fingerprint', 'digital', 'identidade', 'seguranca'],
    imgUrl: `${GROUP_CHAT_APPLE_EMOJI_IMAGE_BASE_URL}1fac6.png`,
  },
  {
    id: '1fabe',
    names: ['leafless tree', 'arvore seca', 'arvore sem folhas'],
    imgUrl: `${GROUP_CHAT_APPLE_EMOJI_IMAGE_BASE_URL}1fabe.png`,
  },
  {
    id: '1fadc',
    names: ['root vegetable', 'vegetal', 'raiz', 'beterraba'],
    imgUrl: `${GROUP_CHAT_APPLE_EMOJI_IMAGE_BASE_URL}1fadc.png`,
  },
  {
    id: '1fa89',
    names: ['harp', 'harpa', 'musica'],
    imgUrl: `${GROUP_CHAT_APPLE_EMOJI_IMAGE_BASE_URL}1fa89.png`,
  },
  {
    id: '1fa8f',
    names: ['shovel', 'pa', 'cavar'],
    imgUrl: `${GROUP_CHAT_APPLE_EMOJI_IMAGE_BASE_URL}1fa8f.png`,
  },
  {
    id: '1fadf',
    names: ['splatter', 'respingo', 'tinta', 'mancha'],
    imgUrl: `${GROUP_CHAT_APPLE_EMOJI_IMAGE_BASE_URL}1fadf.png`,
  },
  {
    id: '1f1e8-1f1f6',
    names: ['flag sark', 'bandeira sark'],
    imgUrl: `${GROUP_CHAT_APPLE_EMOJI_IMAGE_BASE_URL}1f1e8-1f1f6.png`,
  },
  {
    id: '1faea',
    names: ['distorted face', 'rosto distorcido', 'ansiedade', 'panico'],
    imgUrl: `${GROUP_CHAT_NOTO_EMOJI_IMAGE_BASE_URL}emoji_u1faea.png`,
  },
  {
    id: '1faef',
    names: ['fight cloud', 'briga', 'discussao', 'luta'],
    imgUrl: `${GROUP_CHAT_NOTO_EMOJI_IMAGE_BASE_URL}emoji_u1faef.png`,
  },
  {
    id: '1fac8',
    names: ['hairy creature', 'criatura peluda', 'sasquatch', 'yeti'],
    imgUrl: `${GROUP_CHAT_NOTO_EMOJI_IMAGE_BASE_URL}emoji_u1fac8.png`,
  },
  {
    id: '1f9d1-200d-1fa70',
    names: ['ballet dancer', 'bale', 'dancarino', 'dancar'],
    imgUrl: `${GROUP_CHAT_NOTO_EMOJI_IMAGE_BASE_URL}emoji_u1f9d1_200d_1fa70.png`,
  },
  {
    id: '1facd',
    names: ['orca', 'baleia', 'mar'],
    imgUrl: `${GROUP_CHAT_NOTO_EMOJI_IMAGE_BASE_URL}emoji_u1facd.png`,
  },
  {
    id: '1f6d8',
    names: ['landslide', 'deslizamento', 'avalanche'],
    imgUrl: `${GROUP_CHAT_NOTO_EMOJI_IMAGE_BASE_URL}emoji_u1f6d8.png`,
  },
  {
    id: '1fa8a',
    names: ['trombone', 'musica', 'instrumento'],
    imgUrl: `${GROUP_CHAT_NOTO_EMOJI_IMAGE_BASE_URL}emoji_u1fa8a.png`,
  },
  {
    id: '1fa8e',
    names: ['treasure chest', 'tesouro', 'bau', 'premio'],
    imgUrl: `${GROUP_CHAT_NOTO_EMOJI_IMAGE_BASE_URL}emoji_u1fa8e.png`,
  },
]

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

function getScrollBehavior(): ScrollBehavior {
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 'auto'
  }

  return 'smooth'
}

function hasCoarsePointer() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
}

function emojiFromUnified(unified: string) {
  return unified
    .split('-')
    .map(hex => String.fromCodePoint(Number.parseInt(hex, 16)))
    .join('')
}

function resizeComposerInput(element: HTMLTextAreaElement) {
  element.style.height = 'auto'
  const nextHeight = Math.min(element.scrollHeight, GROUP_CHAT_COMPOSER_MAX_HEIGHT)
  element.style.height = `${nextHeight}px`
  element.style.overflowY =
    element.scrollHeight > GROUP_CHAT_COMPOSER_MAX_HEIGHT ? 'auto' : 'hidden'
}

function useMobileBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    if (typeof window.matchMedia !== 'function') return

    const mediaQuery = window.matchMedia(GROUP_CHAT_MOBILE_SCROLL_LOCK_QUERY)
    let unlock: (() => void) | null = null

    function lockBody() {
      if (unlock || !mediaQuery.matches) return

      const scrollY = window.scrollY
      const bodyStyles = {
        left: document.body.style.left,
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        right: document.body.style.right,
        top: document.body.style.top,
        width: document.body.style.width,
      }
      const htmlOverflow = document.documentElement.style.overflow

      document.documentElement.style.overflow = 'hidden'
      document.body.style.left = '0'
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.right = '0'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'

      unlock = () => {
        document.documentElement.style.overflow = htmlOverflow
        document.body.style.left = bodyStyles.left
        document.body.style.overflow = bodyStyles.overflow
        document.body.style.position = bodyStyles.position
        document.body.style.right = bodyStyles.right
        document.body.style.top = bodyStyles.top
        document.body.style.width = bodyStyles.width
        window.scrollTo(0, scrollY)
      }
    }

    function syncLock() {
      if (mediaQuery.matches) {
        lockBody()
        return
      }

      unlock?.()
      unlock = null
    }

    syncLock()
    mediaQuery.addEventListener('change', syncLock)

    return () => {
      mediaQuery.removeEventListener('change', syncLock)
      unlock?.()
    }
  }, [locked])
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

const CHAT_PUSH_PROMPT_DISMISSED_KEY = 'betabet:chat-push-prompt-dismissed'

function wasChatPushPromptDismissed(): boolean {
  try {
    return localStorage.getItem(CHAT_PUSH_PROMPT_DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

function rememberChatPushPromptDismissed(): void {
  try {
    localStorage.setItem(CHAT_PUSH_PROMPT_DISMISSED_KEY, '1')
  } catch {
    /* ignore */
  }
}

function ChatPushNotificationPrompt({
  open,
  push,
}: {
  open: boolean
  push: PushNotifications
}) {
  // Persist the user's choice so the popup doesn't nag on every chat open. The
  // panel unmounts when the chat closes, so component state alone would reset
  // each time. Once dismissed or enabled the discreet CTA still lets the user
  // turn notifications on later.
  const [dismissed, setDismissed] = useState(wasChatPushPromptDismissed)
  const promptOpen = open && push.canEnable && !dismissed

  const dismiss = useCallback(() => {
    rememberChatPushPromptDismissed()
    setDismissed(true)
  }, [])

  async function handleEnable() {
    const enabled = await push.enable()
    if (enabled) dismiss()
  }

  return (
    <Modal
      open={promptOpen}
      onOpenChange={nextOpen => {
        if (!nextOpen && !push.busy) dismiss()
      }}
      title="Ative as notificações do chat"
      description="Receba avisos quando chegarem novas mensagens no bolão."
      showClose={!push.busy}
      className="mx-auto max-w-sm"
    >
      <div className="space-y-4 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand)_14%,var(--surface-soft))] text-[var(--brand)]">
            <Bell aria-hidden="true" size={20} />
          </span>
          <p className="min-w-0 text-sm leading-6 text-[var(--text-muted)]">
            O chat avisa neste aparelho quando alguém mandar mensagem enquanto você estiver fora.
          </p>
        </div>

        {push.error ? (
          <p className="rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--danger)_36%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface))] px-3 py-2 text-sm text-[var(--danger)]">
            {push.error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={push.busy}
            onClick={dismiss}
          >
            Agora não
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={push.busy}
            onClick={() => {
              void handleEnable()
            }}
          >
            {push.busy ? (
              <Loader2 aria-hidden="true" size={15} className="animate-spin" />
            ) : (
              <Bell aria-hidden="true" size={15} />
            )}
            Ativar notificações
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function ChatPushNotificationCta({ push }: { push: PushNotifications }) {
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

function ChatPushNotifications({ open }: { open: boolean }) {
  const push = usePushNotifications()

  return (
    <>
      <ChatPushNotificationPrompt open={open} push={push} />
      <ChatPushNotificationCta push={push} />
    </>
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
  onSend: (body: string, mentionedUserIds: string[]) => Promise<{ id: string } | null>
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const mirrorRef = useRef<HTMLDivElement | null>(null)
  const emojiPickerRef = useRef<HTMLDivElement | null>(null)
  const [body, setBody] = useState('')
  const [caretPosition, setCaretPosition] = useState(0)
  const bodyRef = useRef(body)
  const caretPositionRef = useRef(caretPosition)
  const selectionRef = useRef({ start: caretPosition, end: caretPosition })
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
      focusComposerAt(caretPositionRef.current)
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)
    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [emojiPickerOpen, focusComposerAt])

  function setComposerValue(nextBody: string, nextCaretPosition: number) {
    bodyRef.current = nextBody
    caretPositionRef.current = nextCaretPosition
    selectionRef.current = { start: nextCaretPosition, end: nextCaretPosition }
    setBody(nextBody)
    setCaretPosition(nextCaretPosition)
  }

  function updateBody(nextBody: string, nextCaretPosition: number) {
    const nextActiveMention = findActiveMentionToken(nextBody, nextCaretPosition)
    setComposerValue(nextBody, nextCaretPosition)
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
    setComposerValue(inserted.value, inserted.caretPosition)
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
    const currentBody = bodyRef.current
    const currentSelection = selectionRef.current
    const selectionStart = Math.min(currentSelection.start, currentBody.length)
    const selectionEnd = Math.min(currentSelection.end, currentBody.length)
    const emoji = emojiData.isCustom ? emojiFromUnified(emojiData.unified) : emojiData.emoji
    const nextBody = `${currentBody.slice(0, selectionStart)}${emoji}${currentBody.slice(selectionEnd)}`
    const nextCaretPosition = selectionStart + emoji.length

    updateBody(nextBody, nextCaretPosition)
    setMentionPickerOpen(false)
    if (!hasCoarsePointer()) {
      focusComposerAt(nextCaretPosition)
    }
  }

  async function submit() {
    if (!canSend) return
    const nextBody = body
    const sentMessage = await onSend(nextBody, getMentionedUserIds(nextBody, selectedMentions))
    if (sentMessage) {
      setComposerValue('', 0)
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
            <div
              className="group-chat-emoji-popover absolute bottom-full left-0 z-20 mb-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
              onMouseDownCapture={event => {
                const target = event.target
                if (target instanceof HTMLElement && target.closest('button,[role="button"]')) {
                  event.preventDefault()
                }
              }}
            >
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
                    if (!hasCoarsePointer()) {
                      focusComposerAt(caretPositionRef.current)
                    }
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
                autoFocusSearch={false}
                emojiStyle={EmojiStyle.NATIVE}
                suggestedEmojisMode={SuggestionMode.RECENT}
                theme={Theme.AUTO}
                categories={GROUP_CHAT_EMOJI_PICKER_CATEGORIES}
                customEmojis={GROUP_CHAT_LATEST_EMOJIS}
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
              const nextOpen = !emojiPickerOpen
              setMentionPickerOpen(false)
              setEmojiPickerOpen(nextOpen)
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
              const { selectionStart, selectionEnd } = event.currentTarget
              const nextCaretPosition = selectionStart
              caretPositionRef.current = nextCaretPosition
              selectionRef.current = { start: selectionStart, end: selectionEnd }
              setCaretPosition(nextCaretPosition)
            }}
            onScroll={event => {
              syncMirrorScroll(event.currentTarget)
            }}
            onKeyDown={event => {
              const isEnter = event.key === 'Enter'

              if (isEnter && hasCoarsePointer()) {
                if (lineCount >= GROUP_CHAT_MESSAGE_MAX_LINES) {
                  event.preventDefault()
                }
                return
              }

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
                if (isEnter || event.key === 'Tab') {
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

              if (isEnter && !event.shiftKey) {
                event.preventDefault()
                void submit()
              } else if (isEnter && lineCount >= GROUP_CHAT_MESSAGE_MAX_LINES) {
                event.preventDefault()
              }
            }}
            rows={1}
            maxLength={GROUP_CHAT_MESSAGE_MAX_LENGTH}
            enterKeyHint="enter"
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
  const [sentMessageToRevealId, setSentMessageToRevealId] = useState<string | null>(null)

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

  useMobileBodyScrollLock(open)

  const handleSendMessage = useCallback(async (body: string, mentionedUserIds: string[]) => {
    const sentMessage = await chat.sendMessage(body, mentionedUserIds)
    if (sentMessage) setSentMessageToRevealId(sentMessage.id)
    return sentMessage
  }, [chat])

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

  useLayoutEffect(() => {
    if (!open || !sentMessageToRevealId) return
    if (!messages.some(message => message.id === sentMessageToRevealId)) return

    const element = listRef.current
    if (!element) return

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(`group-chat-message-${sentMessageToRevealId}`)
      if (!target || !element.contains(target)) return

      element.scrollTo({
        top: element.scrollHeight,
        behavior: getScrollBehavior(),
      })
      setSentMessageToRevealId(null)
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [messages, open, sentMessageToRevealId])

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
        'fixed z-40 flex flex-col overflow-hidden overscroll-contain border border-[var(--border)] bg-[var(--surface)] shadow-2xl transition duration-200',
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

      <ChatPushNotifications open={open} />

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[var(--surface-soft)] px-3 py-4 [-webkit-overflow-scrolling:touch]"
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
        onSend={handleSendMessage}
      />
    </section>
  )
}
