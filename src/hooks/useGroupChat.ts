import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import * as chatService from '@/services/chat.service'
import {
  GROUP_CHAT_MESSAGE_MAX_LENGTH,
  GROUP_CHAT_MESSAGE_MAX_LINES,
  countGroupChatMessageLines,
} from '@/types/group-chat.types'
import type {
  GroupChatMessage,
  GroupChatMessageEvent,
  GroupChatState,
} from '@/types/group-chat.types'

const PAGE_SIZE = 30

const emptyState: GroupChatState = {
  lastSeenMessageId: null,
  latestMessageId: null,
  unreadCount: 0,
  mentionUnreadCount: 0,
}

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting'

function messageId(message: GroupChatMessage) {
  return Number(message.id)
}

function mergeMessages(current: GroupChatMessage[], incoming: GroupChatMessage[]) {
  const byId = new Map(current.map(message => [message.id, message]))
  for (const message of incoming) {
    byId.set(message.id, message)
  }
  return Array.from(byId.values()).sort((a, b) => messageId(a) - messageId(b))
}

function isAfter(id: string, otherId: string | null) {
  return otherId === null || Number(id) > Number(otherId)
}

export function useGroupChat(groupId: string | null, open: boolean) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<GroupChatMessage[]>([])
  const [state, setState] = useState<GroupChatState>(emptyState)
  const [hasMoreBefore, setHasMoreBefore] = useState(false)
  const [hasMoreAfter, setHasMoreAfter] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadingInitial, setIsLoadingInitial] = useState(false)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const [initialAnchorMessageId, setInitialAnchorMessageId] = useState<string | null>(null)
  const latestMarkedRef = useRef<string | null>(null)
  const latestMessageIdRef = useRef<string | null>(null)
  const messagesRef = useRef<GroupChatMessage[]>([])
  const isLoadedRef = useRef(false)
  const reconnectAfterIdRef = useRef<string | null>(null)
  const catchUpRunningRef = useRef(false)

  useEffect(() => {
    setMessages([])
    setState(emptyState)
    setHasMoreBefore(false)
    setHasMoreAfter(false)
    setIsLoaded(false)
    setError(null)
    setInitialAnchorMessageId(null)
    latestMarkedRef.current = null
    latestMessageIdRef.current = null
    messagesRef.current = []
    isLoadedRef.current = false
    reconnectAfterIdRef.current = null
    catchUpRunningRef.current = false
  }, [groupId])

  useEffect(() => {
    latestMessageIdRef.current = state.latestMessageId
  }, [state.latestMessageId])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    isLoadedRef.current = isLoaded
  }, [isLoaded])

  const refreshState = useCallback(async () => {
    if (!groupId) return
    const nextState = await chatService.getGroupChatState(groupId)
    setState(nextState)
  }, [groupId])

  useEffect(() => {
    if (!groupId) return
    void refreshState().catch(() => {
      setError('Não foi possível carregar o estado do chat.')
    })
  }, [groupId, refreshState])

  const catchUpAfterReconnect = useCallback(async (afterId: string | null) => {
    if (!groupId || !afterId || catchUpRunningRef.current) return
    catchUpRunningRef.current = true
    try {
      const incoming: GroupChatMessage[] = []
      let cursor: string | null = afterId
      let hasMore = false

      for (let page = 0; page < 10 && cursor; page += 1) {
        const response = await chatService.getGroupChatMessages(groupId, {
          limit: PAGE_SIZE,
          afterId: cursor,
        })
        incoming.push(...response.messages)
        hasMore = response.hasMoreAfter
        const last = response.messages[response.messages.length - 1]
        if (!hasMore || !last) break
        cursor = last.id
      }

      const nextState = await chatService.getGroupChatState(groupId)
      setState(nextState)
      if (incoming.length > 0 && (isLoadedRef.current || messagesRef.current.length > 0)) {
        setMessages(prev => mergeMessages(prev, incoming))
      }
      setHasMoreAfter(hasMore)
    } catch {
      setError('Não foi possível atualizar o chat após reconectar.')
    } finally {
      catchUpRunningRef.current = false
    }
  }, [groupId])

  useEffect(() => {
    if (!groupId) {
      setConnectionStatus('idle')
      return
    }

    setConnectionStatus('connecting')
    const source = chatService.createGroupChatEventSource(groupId)

    source.onopen = () => {
      setConnectionStatus('connected')
      const afterId = reconnectAfterIdRef.current
      reconnectAfterIdRef.current = null
      void catchUpAfterReconnect(afterId)
    }
    source.onerror = () => {
      reconnectAfterIdRef.current = latestMessageIdRef.current
      setConnectionStatus('reconnecting')
    }

    const onMessageCreated = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as GroupChatMessageEvent
        const incoming = payload.message
        if (incoming.groupId !== groupId) return

        setState(prev => ({
          lastSeenMessageId: prev.lastSeenMessageId,
          latestMessageId: incoming.id,
          unreadCount: incoming.userId === user?.id ? prev.unreadCount : prev.unreadCount + 1,
          mentionUnreadCount:
            incoming.userId !== user?.id && (incoming.mentions ?? []).some(mention => mention.userId === user?.id)
              ? prev.mentionUnreadCount + 1
              : prev.mentionUnreadCount,
        }))

        // Anexa quando a janela já foi carregada — inclusive vazia (chat novo).
        // Usar prev.length descartava a 1ª mensagem de uma conversa recém-aberta.
        setMessages(prev => (isLoadedRef.current ? mergeMessages(prev, [incoming]) : prev))
      } catch {
        // Ignora eventos malformados; o EventSource reconecta sozinho se cair.
      }
    }

    source.addEventListener('message.created', onMessageCreated as EventListener)

    return () => {
      source.removeEventListener('message.created', onMessageCreated as EventListener)
      source.close()
      setConnectionStatus('idle')
    }
  }, [catchUpAfterReconnect, groupId, user?.id])

  const loadInitial = useCallback(async () => {
    if (!groupId) return
    setIsLoadingInitial(true)
    setError(null)
    try {
      const stateBefore = await chatService.getGroupChatState(groupId)
      const response = await chatService.getGroupChatMessages(groupId, { limit: PAGE_SIZE })
      setState(stateBefore)
      setInitialAnchorMessageId(stateBefore.lastSeenMessageId)
      setMessages(response.messages)
      setHasMoreBefore(response.hasMoreBefore)
      setHasMoreAfter(response.hasMoreAfter)
      setIsLoaded(true)
    } catch {
      setError('Não foi possível carregar as mensagens.')
    } finally {
      setIsLoadingInitial(false)
    }
  }, [groupId])

  useEffect(() => {
    if (open && groupId && !isLoaded && !isLoadingInitial) {
      void loadInitial()
    }
  }, [groupId, isLoaded, isLoadingInitial, loadInitial, open])

  const loadOlder = useCallback(async () => {
    if (!groupId || isLoadingOlder || messages.length === 0 || !hasMoreBefore) return false
    setIsLoadingOlder(true)
    setError(null)
    try {
      const response = await chatService.getGroupChatMessages(groupId, {
        limit: PAGE_SIZE,
        beforeId: messages[0].id,
      })
      setMessages(prev => mergeMessages(prev, response.messages))
      setHasMoreBefore(response.hasMoreBefore)
      setHasMoreAfter(response.hasMoreAfter)
      return response.messages.length > 0
    } catch {
      setError('Não foi possível carregar mensagens antigas.')
      return false
    } finally {
      setIsLoadingOlder(false)
    }
  }, [groupId, hasMoreBefore, isLoadingOlder, messages])

  const markReadThrough = useCallback(async (lastSeenMessageId: string) => {
    if (!groupId) return
    if (!isAfter(lastSeenMessageId, latestMarkedRef.current)) return
    latestMarkedRef.current = lastSeenMessageId
    try {
      const nextState = await chatService.updateGroupChatReadState(groupId, lastSeenMessageId)
      setState(nextState)
    } catch {
      latestMarkedRef.current = null
    }
  }, [groupId])

  const sendMessage = useCallback(async (body: string, mentionedUserIds: string[] = []) => {
    if (!groupId) return null
    const trimmed = body.trim()
    if (!trimmed) {
      setError('Digite uma mensagem.')
      return null
    }
    if (trimmed.length > GROUP_CHAT_MESSAGE_MAX_LENGTH) {
      setError(`A mensagem deve ter no máximo ${GROUP_CHAT_MESSAGE_MAX_LENGTH} caracteres.`)
      return null
    }
    if (countGroupChatMessageLines(trimmed) > GROUP_CHAT_MESSAGE_MAX_LINES) {
      setError(`A mensagem deve ter no máximo ${GROUP_CHAT_MESSAGE_MAX_LINES} linhas.`)
      return null
    }

    setIsSending(true)
    setError(null)
    try {
      const { message } = await chatService.sendGroupChatMessage(groupId, trimmed, mentionedUserIds)
      setMessages(prev => mergeMessages(prev, [message]))
      setState(prev => ({
        ...prev,
        latestMessageId: message.id,
      }))
      await markReadThrough(message.id)
      return message
    } catch {
      setError('Não foi possível enviar. Tente novamente.')
      return null
    } finally {
      setIsSending(false)
    }
  }, [groupId, markReadThrough])

  return {
    messages,
    state,
    hasMoreBefore,
    hasMoreAfter,
    isLoaded,
    isLoadingInitial,
    isLoadingOlder,
    isSending,
    error,
    connectionStatus,
    initialAnchorMessageId,
    loadOlder,
    markReadThrough,
    refreshState,
    sendMessage,
  }
}
