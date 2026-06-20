import type { GroupMembership } from '@/types/group.types'

export const GROUP_CHAT_MAX_MENTIONS = 10

export interface ActiveMentionToken {
  start: number
  end: number
  query: string
}

export interface SelectedChatMention {
  userId: string
  displayText: string
}

export function normalizeMentionText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function findActiveMentionToken(value: string, caretPosition: number): ActiveMentionToken | null {
  const beforeCaret = value.slice(0, caretPosition)
  const match = /(^|\s)@([^\s@]*)$/.exec(beforeCaret)
  if (!match) return null

  const query = match[2]
  return {
    start: beforeCaret.length - query.length - 1,
    end: caretPosition,
    query,
  }
}

export function filterMentionMembers(
  members: GroupMembership[],
  query: string,
  currentUserId: string | undefined,
  limit = 6,
) {
  const normalizedQuery = normalizeMentionText(query)
  const candidates = members.filter(member => member.user.id !== currentUserId)

  if (!normalizedQuery) return candidates.slice(0, limit)

  return candidates
    .map(member => {
      const normalizedName = normalizeMentionText(member.user.name)
      return {
        member,
        startsWith: normalizedName.startsWith(normalizedQuery),
        includes: normalizedName.includes(normalizedQuery),
      }
    })
    .filter(item => item.includes)
    .sort((a, b) => Number(b.startsWith) - Number(a.startsWith))
    .slice(0, limit)
    .map(item => item.member)
}

export function insertMentionText(
  value: string,
  token: ActiveMentionToken,
  displayText: string,
) {
  const mentionText = `@${displayText}`
  const after = value.slice(token.end)
  const suffix = after.length === 0 || !/^\s/.test(after) ? ' ' : ''
  const nextValue = `${value.slice(0, token.start)}${mentionText}${suffix}${after}`

  return {
    value: nextValue,
    caretPosition: token.start + mentionText.length + suffix.length,
  }
}

export function dedupeSelectedMentions(mentions: SelectedChatMention[]) {
  const byUserId = new Map<string, SelectedChatMention>()
  for (const mention of mentions) {
    byUserId.set(mention.userId, mention)
  }
  return Array.from(byUserId.values()).slice(0, GROUP_CHAT_MAX_MENTIONS)
}

export function getVisibleSelectedMentions(
  body: string,
  mentions: SelectedChatMention[],
) {
  return dedupeSelectedMentions(mentions).filter(mention => body.includes(`@${mention.displayText}`))
}

export function getMentionedUserIds(body: string, mentions: SelectedChatMention[]) {
  return getVisibleSelectedMentions(body, mentions).map(mention => mention.userId)
}
