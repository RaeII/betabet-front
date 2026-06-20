import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

import { GroupChatWidget } from '@/components/group-chat/GroupChatWidget'
import { useGroupChat } from '@/hooks/useGroupChat'

const mockedUseGroupChat = useGroupChat as ReturnType<typeof vi.fn>
const sendMessage = vi.fn(async () => true)

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
      },
    ],
    state: {
      lastSeenMessageId: null,
      latestMessageId: '1',
      unreadCount: 2,
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

function renderWidget(path: string, routePath: string) {
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(
        Routes,
        null,
        createElement(Route, { path: routePath, element: createElement(GroupChatWidget) }),
      ),
    ),
  )
}

describe('GroupChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGroupChat.mockReturnValue(chatReturn())
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
    expect(await screen.findByRole('dialog', { name: /Chat do bolão/i })).toBeInTheDocument()
    expect(screen.getByText('Olá')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Mensagem do chat'), {
      target: { value: 'Nova mensagem' },
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Enviar mensagem/i }))
    })

    expect(sendMessage).toHaveBeenCalledWith('Nova mensagem')
  })
})
