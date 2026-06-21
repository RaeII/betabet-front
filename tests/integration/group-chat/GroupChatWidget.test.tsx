import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createElement } from 'react'

vi.mock('@/hooks/useActiveGroup', () => ({
  useActiveGroup: () => ({
    groupId: 'g1',
    group: {
      id: 'g1',
      name: 'Bolão Chat',
      emoji: null,
      coverUrl: null,
      adminId: 'u1',
      resultPoints: 1,
      exactScorePoints: 3,
      championBetEnabled: true,
      championFirstPoints: 15,
      championSecondPoints: 10,
      showBetsBeforeKickoff: true,
      joinMode: 'request',
      memberCount: 2,
      inviteCode: 'ABC123',
      chatEnabled: true,
      createdAt: new Date().toISOString(),
    },
    role: 'member',
    isAdmin: false,
  }),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'u1',
      name: 'Usuário',
      avatarUrl: null,
    },
  }),
}))

vi.mock('@/hooks/useGroupChat', () => ({
  useGroupChat: vi.fn(),
}))

vi.mock('@/hooks/usePushNotifications', () => ({
  usePushNotifications: () => ({
    status: 'unsupported',
    busy: false,
    error: null,
    isSupported: false,
    isActive: false,
    canEnable: false,
    enable: vi.fn(async () => false),
    disable: vi.fn(async () => false),
    refresh: vi.fn(async () => undefined),
    syncExisting: vi.fn(async () => undefined),
  }),
}))

vi.mock('@/hooks/useRanking', () => ({
  useGroupRanking: vi.fn(),
}))

vi.mock('@/hooks/useGroups', () => ({
  useGroupMembers: vi.fn(),
}))

import { GroupChatWidget } from '@/components/group-chat/GroupChatWidget'
import { useGroupChat } from '@/hooks/useGroupChat'
import { useGroupMembers } from '@/hooks/useGroups'
import { useGroupRanking } from '@/hooks/useRanking'

const mockedUseGroupChat = useGroupChat as ReturnType<typeof vi.fn>
const mockedUseGroupMembers = useGroupMembers as ReturnType<typeof vi.fn>
const mockedUseGroupRanking = useGroupRanking as ReturnType<typeof vi.fn>
const sendMessage = vi.fn(async () => true)

function message(id: string, body = `Mensagem ${id}`) {
  return {
    id,
    groupId: 'g1',
    userId: 'u2',
    body,
    createdAt: new Date(`2026-06-20T12:${id.padStart(2, '0')}:00.000Z`).toISOString(),
    user: { id: 'u2', name: 'Maria', avatarUrl: null },
    mentions: [],
  }
}

const rankingResponse = {
  data: {
    ranking: [
      {
        userId: 'u2',
        userName: 'Maria',
        avatarUrl: null,
        position: 1,
        totalPoints: 18,
        exactScorePredictions: 3,
        totalBets: 6,
      },
      {
        userId: 'u1',
        userName: 'Usuário',
        avatarUrl: null,
        position: 2,
        totalPoints: 12,
        exactScorePredictions: 2,
        totalBets: 5,
      },
    ],
    updatedAt: new Date('2026-06-20T12:00:00.000Z').toISOString(),
  },
  isLoading: false,
}

function chatReturn(overrides: Record<string, unknown> = {}) {
  return {
    messages: [
      {
        id: '1',
        groupId: 'g1',
        userId: 'u2',
        body: 'Olá',
        createdAt: new Date('2026-06-20T12:00:00.000Z').toISOString(),
        user: { id: 'u2', name: 'Maria', avatarUrl: null },
        mentions: [],
      },
    ],
    state: {
      lastSeenMessageId: null,
      latestMessageId: '1',
      unreadCount: 2,
      mentionUnreadCount: 0,
    },
    hasMoreBefore: false,
    hasMoreAfter: false,
    isLoaded: true,
    isLoadingInitial: false,
    isLoadingOlder: false,
    isSending: false,
    error: null,
    connectionStatus: 'connected',
    initialAnchorMessageId: null,
    loadOlder: vi.fn(async () => false),
    markReadThrough: vi.fn(async () => undefined),
    refreshState: vi.fn(async () => undefined),
    sendMessage,
    ...overrides,
  }
}

function widgetElement(path: string, routePath: string) {
  return createElement(
    MemoryRouter,
    { initialEntries: [path] },
    createElement(
      Routes,
      null,
      createElement(Route, { path: routePath, element: createElement(GroupChatWidget) }),
    ),
  )
}

function renderWidget(path: string, routePath: string) {
  return render(widgetElement(path, routePath))
}

function domRect(top: number, height: number): DOMRect {
  return {
    x: 0,
    y: top,
    width: 320,
    height,
    top,
    right: 320,
    bottom: top + height,
    left: 0,
    toJSON: () => ({}),
  } as DOMRect
}

function restoreDescriptor(
  target: object,
  property: string,
  descriptor: PropertyDescriptor | undefined,
) {
  if (descriptor) {
    Object.defineProperty(target, property, descriptor)
  } else {
    delete (target as Record<string, unknown>)[property]
  }
}

function mockChatListLayout(messageTops: Record<string, number> = {}) {
  const scrollHeightDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
  const clientHeightDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
  const offsetHeightDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
  const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    if (this.dataset.groupChatMessageList === 'true') return domRect(0, 300)
    if (this.id.startsWith('group-chat-message-')) {
      return domRect(messageTops[this.id.replace('group-chat-message-', '')] ?? 0, 40)
    }
    return domRect(0, 0)
  })

  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get() {
      return this.dataset.groupChatMessageList === 'true' ? 900 : 0
    },
  })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get() {
      return this.dataset.groupChatMessageList === 'true' ? 300 : 0
    },
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get() {
      return this.id.startsWith('group-chat-message-') ? 40 : 0
    },
  })

  return () => {
    rectSpy.mockRestore()
    restoreDescriptor(HTMLElement.prototype, 'scrollHeight', scrollHeightDescriptor)
    restoreDescriptor(HTMLElement.prototype, 'clientHeight', clientHeightDescriptor)
    restoreDescriptor(HTMLElement.prototype, 'offsetHeight', offsetHeightDescriptor)
  }
}

function getChatMessageList() {
  const element = document.querySelector('[data-group-chat-message-list="true"]')
  if (!(element instanceof HTMLElement)) throw new Error('Chat message list not found')
  return element
}

describe('GroupChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.sessionStorage.clear()
    mockedUseGroupChat.mockReturnValue(chatReturn())
    mockedUseGroupMembers.mockReturnValue({
      data: {
        members: [
          {
            groupId: 'g1',
            userId: 'u1',
            role: 'member',
            joinedAt: new Date().toISOString(),
            user: { id: 'u1', name: 'Usuário', avatarUrl: null },
          },
          {
            groupId: 'g1',
            userId: 'u2',
            role: 'member',
            joinedAt: new Date().toISOString(),
            user: { id: 'u2', name: 'Maria', avatarUrl: null },
          },
        ],
      },
    })
    mockedUseGroupRanking.mockReturnValue(rankingResponse)
  })

  it('renders on /groups/:groupId routes with unread badge', () => {
    renderWidget('/groups/g1/ranking', '/groups/:groupId/*')

    expect(screen.getByRole('button', { name: /Abrir chat do bolão/i })).toBeInTheDocument()
    expect(screen.getByLabelText('2 mensagens não lidas')).toBeInTheDocument()
  })

  it('does not render outside group routes', () => {
    renderWidget('/profile', '/profile')
    expect(screen.queryByRole('button', { name: /Abrir chat do bolão/i })).not.toBeInTheDocument()
  })

  it('does not render on global matches routes', () => {
    renderWidget('/matches', '/matches')
    expect(screen.queryByRole('button', { name: /Abrir chat do bolão/i })).not.toBeInTheDocument()
  })

  it('opens panel and sends a message', async () => {
    renderWidget('/groups/g1', '/groups/:groupId/*')

    fireEvent.click(screen.getByRole('button', { name: /Abrir chat do bolão/i }))
    const dialog = await screen.findByRole('dialog', { name: /Chat do bolão/i })
    expect(dialog).toBeInTheDocument()
    expect(dialog.className).toContain('left-3')
    expect(dialog.className).toContain('right-3')
    expect(dialog.className).toContain('top-[calc(4rem+env(safe-area-inset-top)+0.75rem)]')
    expect(dialog.className).toContain('bottom-[calc(4.5rem+env(safe-area-inset-bottom))]')
    expect(screen.getByText('Olá')).toBeInTheDocument()
    expect(screen.getByText('Maria')).toBeInTheDocument()
    expect(screen.getByLabelText('Posição 1 no ranking')).toHaveTextContent('1°')
    expect(screen.getByLabelText('Primeiro lugar')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Mensagem do chat'), {
      target: { value: 'Nova mensagem' },
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Enviar mensagem/i }))
    })

    expect(sendMessage).toHaveBeenCalledWith('Nova mensagem', [])
  })

  it('keeps the composer readable on iOS without forcing an action keyboard', async () => {
    renderWidget('/groups/g1', '/groups/:groupId/*')

    fireEvent.click(screen.getByRole('button', { name: /Abrir chat do bolão/i }))
    await screen.findByRole('dialog', { name: /Chat do bolão/i })

    const composer = screen.getByLabelText('Mensagem do chat')
    expect(composer).not.toHaveAttribute('inputmode')
    expect(composer).not.toHaveAttribute('enterkeyhint')
    expect(composer).toHaveAttribute('autocomplete', 'off')
    expect(composer).toHaveAttribute('autocorrect', 'off')
    expect(composer).toHaveAttribute('autocapitalize', 'off')
    expect(composer).toHaveAttribute('spellcheck', 'false')
    expect(composer).toHaveClass('text-base')
    expect(composer).toHaveClass('leading-5')
  })

  it('opens at the bottom when there are no unread messages, ignoring a stale initial anchor', async () => {
    const restoreLayout = mockChatListLayout()
    mockedUseGroupChat.mockReturnValue(
      chatReturn({
        messages: [message('1'), message('2'), message('3')],
        state: {
          lastSeenMessageId: '3',
          latestMessageId: '3',
          unreadCount: 0,
          mentionUnreadCount: 0,
        },
        initialAnchorMessageId: '1',
      }),
    )

    try {
      renderWidget('/groups/g1', '/groups/:groupId/*')

      fireEvent.click(screen.getByRole('button', { name: /Abrir chat do bolão/i }))
      await screen.findByRole('dialog', { name: /Chat do bolão/i })

      await waitFor(() => expect(getChatMessageList().scrollTop).toBe(900))
    } finally {
      restoreLayout()
    }
  })

  it('restores the saved chat scroll position without using page scroll', async () => {
    const restoreLayout = mockChatListLayout({ 2: 300 })
    const scrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY')
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 640 })
    window.sessionStorage.setItem(
      'betabet:group-chat-scroll:u1:g1',
      JSON.stringify({
        anchorMessageId: '2',
        anchorOffset: 12,
        wasNearBottom: false,
      }),
    )
    mockedUseGroupChat.mockReturnValue(
      chatReturn({
        messages: [message('1'), message('2'), message('3')],
        state: {
          lastSeenMessageId: '3',
          latestMessageId: '3',
          unreadCount: 0,
          mentionUnreadCount: 0,
        },
        initialAnchorMessageId: null,
      }),
    )

    try {
      renderWidget('/groups/g1', '/groups/:groupId/*')

      fireEvent.click(screen.getByRole('button', { name: /Abrir chat do bolão/i }))
      await screen.findByRole('dialog', { name: /Chat do bolão/i })

      await waitFor(() => expect(getChatMessageList().scrollTop).toBe(312))
      expect(window.scrollY).toBe(640)
    } finally {
      restoreLayout()
      restoreDescriptor(window, 'scrollY', scrollYDescriptor)
    }
  })

  it('shows an icon-only jump button with the new message count', async () => {
    const restoreLayout = mockChatListLayout()
    let chatMock = chatReturn({
      messages: [message('1'), message('2'), message('3')],
      state: {
        lastSeenMessageId: '3',
        latestMessageId: '3',
        unreadCount: 0,
        mentionUnreadCount: 0,
      },
    })
    mockedUseGroupChat.mockImplementation(() => chatMock)

    try {
      const view = renderWidget('/groups/g1', '/groups/:groupId/*')

      fireEvent.click(screen.getByRole('button', { name: /Abrir chat do bolão/i }))
      await screen.findByRole('dialog', { name: /Chat do bolão/i })
      const list = getChatMessageList()
      await waitFor(() => expect(list.scrollTop).toBe(900))

      act(() => {
        list.scrollTop = 120
        fireEvent.scroll(list)
      })
      expect(screen.getByRole('button', { name: 'Ir para o fim do chat' })).toBeInTheDocument()

      chatMock = chatReturn({
        messages: [message('1'), message('2'), message('3'), message('4'), message('5')],
        state: {
          lastSeenMessageId: '3',
          latestMessageId: '5',
          unreadCount: 2,
          mentionUnreadCount: 0,
        },
      })
      view.rerender(widgetElement('/groups/g1', '/groups/:groupId/*'))

      const jumpButton = await screen.findByRole('button', {
        name: 'Ir para o fim do chat, 2 mensagens novas',
      })
      expect(jumpButton).toHaveTextContent('2')
      expect(screen.queryByText('Novas mensagens')).not.toBeInTheDocument()

      fireEvent.click(jumpButton)
      expect(list.scrollTop).toBe(900)
    } finally {
      restoreLayout()
      mockedUseGroupChat.mockReset()
    }
  })

  it('opens panel from notification URL param', async () => {
    renderWidget('/groups/g1?chat=1', '/groups/:groupId/*')

    const dialog = await screen.findByRole('dialog', { name: /Chat do bolão/i })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Olá')).toBeInTheDocument()
  })

  it('selects a member mention and sends mentioned user ids', async () => {
    const { container } = renderWidget('/groups/g1', '/groups/:groupId/*')

    fireEvent.click(screen.getByRole('button', { name: /Abrir chat do bolão/i }))
    await screen.findByRole('dialog', { name: /Chat do bolão/i })

    fireEvent.change(screen.getByLabelText('Mensagem do chat'), {
      target: { value: 'Oi @Ma', selectionStart: 6 },
    })
    expect(container.querySelector('[data-group-chat-composer-mention="true"]')).toBeNull()

    fireEvent.mouseDown(screen.getByRole('button', { name: /Mencionar Maria/i }))

    expect(screen.getByLabelText('Mensagem do chat')).toHaveValue('Oi @Maria ')
    expect(container.querySelector('[data-group-chat-composer-mention="true"]')).toHaveTextContent('@Maria')

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Enviar mensagem/i }))
    })

    expect(sendMessage).toHaveBeenCalledWith('Oi @Maria ', ['u2'])
  })

  it('shows mention indicator and highlights messages mentioning the current user', async () => {
    mockedUseGroupChat.mockReturnValue(
      chatReturn({
        messages: [
          {
            id: '1',
            groupId: 'g1',
            userId: 'u2',
            body: 'Oi @Usuário',
            createdAt: new Date('2026-06-20T12:00:00.000Z').toISOString(),
            user: { id: 'u2', name: 'Maria', avatarUrl: null },
            mentions: [
              {
                userId: 'u1',
                displayText: 'Usuário',
                user: { id: 'u1', name: 'Usuário', avatarUrl: null },
              },
            ],
          },
        ],
        state: {
          lastSeenMessageId: null,
          latestMessageId: '1',
          unreadCount: 1,
          mentionUnreadCount: 1,
        },
      }),
    )

    renderWidget('/groups/g1', '/groups/:groupId/*')

    expect(screen.getByLabelText('1 menções não lidas')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Abrir chat do bolão/i }))
    await screen.findByRole('dialog', { name: /Chat do bolão/i })

    expect(screen.getByText('Mencionou você')).toBeInTheDocument()
    expect(screen.getByText('@Usuário')).toBeInTheDocument()
  })

  it('blocks messages with too many line breaks', async () => {
    renderWidget('/groups/g1', '/groups/:groupId/*')

    fireEvent.click(screen.getByRole('button', { name: /Abrir chat do bolão/i }))
    await screen.findByRole('dialog', { name: /Chat do bolão/i })

    fireEvent.change(screen.getByLabelText('Mensagem do chat'), {
      target: { value: ['1', '2', '3', '4', '5', '6', '7'].join('\n') },
    })

    expect(screen.getByText('A mensagem deve ter no máximo 6 linhas.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviar mensagem/i })).toBeDisabled()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('highlights tied first place for the current user too', async () => {
    mockedUseGroupChat.mockReturnValue(
      chatReturn({
        messages: [
          {
            id: '1',
            groupId: 'g1',
            userId: 'u2',
            body: 'Olá',
            createdAt: new Date('2026-06-20T12:00:00.000Z').toISOString(),
            user: { id: 'u2', name: 'Maria', avatarUrl: null },
            mentions: [],
          },
          {
            id: '2',
            groupId: 'g1',
            userId: 'u1',
            body: 'Também estou em primeiro',
            createdAt: new Date('2026-06-20T12:01:00.000Z').toISOString(),
            user: { id: 'u1', name: 'Usuário', avatarUrl: null },
            mentions: [],
          },
        ],
      }),
    )
    mockedUseGroupRanking.mockReturnValue({
      ...rankingResponse,
      data: {
        ...rankingResponse.data,
        ranking: rankingResponse.data.ranking.map(entry => ({ ...entry, position: 1 })),
      },
    })

    renderWidget('/groups/g1', '/groups/:groupId/*')

    fireEvent.click(screen.getByRole('button', { name: /Abrir chat do bolão/i }))
    await screen.findByRole('dialog', { name: /Chat do bolão/i })

    expect(screen.getByText('você')).toBeInTheDocument()
    expect(screen.queryByText('Usuário')).not.toBeInTheDocument()
    expect(screen.getAllByLabelText('Posição 1 no ranking')).toHaveLength(2)
    expect(screen.getAllByLabelText('Primeiro lugar')).toHaveLength(2)
  })
})
