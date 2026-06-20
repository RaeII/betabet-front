export const GROUP_CHAT_MESSAGE_MAX_LENGTH = 250
export const GROUP_CHAT_MESSAGE_MAX_LINES = 6

export function countGroupChatMessageLines(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').length
}

export interface GroupChatUser {
  id: string
  name: string
  avatarUrl: string | null
}

export interface GroupChatMention {
  userId: string
  displayText: string
  user: GroupChatUser
}

export interface GroupChatMessage {
  id: string
  groupId: string
  userId: string
  body: string
  createdAt: string
  user: GroupChatUser
  mentions: GroupChatMention[]
}

export interface GroupChatState {
  lastSeenMessageId: string | null
  latestMessageId: string | null
  unreadCount: number
  mentionUnreadCount: number
}

export interface GroupChatMessagesResponse {
  messages: GroupChatMessage[]
  hasMoreBefore: boolean
  hasMoreAfter: boolean
}

export interface GroupChatMessageEvent {
  message: GroupChatMessage
}
