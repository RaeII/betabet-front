import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GroupChatMessage, GroupChatState } from '@/types/group-chat.types'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'u1',
      name: 'Usuário',
      avatarUrl: null,
    },
  }),
}))

vi.mock('@/services/chat.service', () => ({
  getGroupChatState: vi.fn(),
  getGroupChatMessages: vi.fn(),
  sendGroupChatMessage: vi.fn(),
  updateGroupChatReadState: vi.fn(),
  createGroupChatEventSource: vi.fn(),
}))

import { useGroupChat } from '@/hooks/useGroupChat'
import * as chatService from '@/services/chat.service'

const initialState: GroupChatState = {
  lastSeenMessageId: null,
  latestMessageId: '1',
  unreadCount: 0,
  mentionUnreadCount: 0,
}

const initialMessage: GroupChatMessage = {
  id: '1',
  groupId: 'g1',
  userId: 'u2',
  body: 'primeira',
  createdAt: '2026-06-20T12:00:00.000Z',
  user: { id: 'u2', name: 'Maria', avatarUrl: null },
  mentions: [],
}

const missedMessage: GroupChatMessage = {
  id: '2',
  groupId: 'g1',
  userId: 'u2',
  body: 'perdida pelo sse',
  createdAt: '2026-06-20T12:01:00.000Z',
  user: { id: 'u2', name: 'Maria', avatarUrl: null },
  mentions: [],
}

function makeEventSource() {
  return {
    onopen: null,
    onerror: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    close: vi.fn(),
  } as unknown as EventSource
}

describe('useGroupChat', () => {
  let currentState: GroupChatState

  beforeEach(() => {
    vi.clearAllMocks()
    currentState = initialState
    vi.mocked(chatService.createGroupChatEventSource).mockReturnValue(makeEventSource())
    vi.mocked(chatService.getGroupChatState).mockImplementation(async () => currentState)
    vi.mocked(chatService.getGroupChatMessages).mockImplementation(async (_groupId, params = {}) => {
      if (params.afterId === '1') {
        return { messages: [missedMessage], hasMoreBefore: false, hasMoreAfter: false }
      }
      return { messages: [initialMessage], hasMoreBefore: false, hasMoreAfter: false }
    })
  })

  it('reconciles a message missed by SSE when the PWA regains focus', async () => {
    const { result } = renderHook(() => useGroupChat('g1', true))

    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    expect(result.current.messages.map(message => message.id)).toEqual(['1'])

    currentState = {
      ...initialState,
      latestMessageId: '2',
      unreadCount: 1,
    }

    act(() => {
      window.dispatchEvent(new Event('focus'))
    })

    await waitFor(() => {
      expect(result.current.messages.map(message => message.id)).toEqual(['1', '2'])
    })
    expect(chatService.getGroupChatMessages).toHaveBeenCalledWith('g1', {
      limit: 30,
      afterId: '1',
    })
  })
})
