export interface GroupChatUser {
  id: string
  name: string
  avatarUrl: string | null
}

export interface GroupChatMessage {
  id: string
  groupId: string
  userId: string
  body: string
  createdAt: string
  user: GroupChatUser
}

export interface GroupChatState {
  lastSeenMessageId: string | null
  latestMessageId: string | null
  unreadCount: number
}

export interface GroupChatMessagesResponse {
  messages: GroupChatMessage[]
  hasMoreBefore: boolean
  hasMoreAfter: boolean
}

export interface GroupChatMessageEvent {
  message: GroupChatMessage
}
