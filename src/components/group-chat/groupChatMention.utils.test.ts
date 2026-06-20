import { describe, expect, it } from 'vitest'
import type { GroupMembership } from '@/types/group.types'
import {
  dedupeSelectedMentions,
  filterMentionMembers,
  findActiveMentionToken,
  getMentionedUserIds,
  insertMentionText,
} from './groupChatMention.utils'

const members: GroupMembership[] = [
  {
    groupId: 'g1',
    userId: 'u1',
    role: 'member',
    joinedAt: '2026-06-20T12:00:00.000Z',
    user: { id: 'u1', name: 'Usuário Atual', avatarUrl: null },
  },
  {
    groupId: 'g1',
    userId: 'u2',
    role: 'member',
    joinedAt: '2026-06-20T12:00:00.000Z',
    user: { id: 'u2', name: 'João Silva', avatarUrl: null },
  },
  {
    groupId: 'g1',
    userId: 'u3',
    role: 'member',
    joinedAt: '2026-06-20T12:00:00.000Z',
    user: { id: 'u3', name: 'Maria', avatarUrl: null },
  },
]

describe('groupChatMention utils', () => {
  it('detects an active @ token at the caret', () => {
    expect(findActiveMentionToken('fala @jo', 8)).toEqual({
      start: 5,
      end: 8,
      query: 'jo',
    })
    expect(findActiveMentionToken('email@teste', 11)).toBeNull()
  })

  it('filters members without showing the current user', () => {
    expect(filterMentionMembers(members, 'joao', 'u1').map(member => member.user.id)).toEqual(['u2'])
    expect(filterMentionMembers(members, '', 'u1').map(member => member.user.id)).toEqual(['u2', 'u3'])
  })

  it('inserts the selected mention and returns the next caret position', () => {
    const token = findActiveMentionToken('fala @jo', 8)
    expect(token).not.toBeNull()
    expect(insertMentionText('fala @jo', token!, 'João Silva')).toEqual({
      value: 'fala @João Silva ',
      caretPosition: 17,
    })
  })

  it('deduplicates and only sends mentions still visible in the body', () => {
    const mentions = dedupeSelectedMentions([
      { userId: 'u2', displayText: 'João Silva' },
      { userId: 'u2', displayText: 'João Silva' },
      { userId: 'u3', displayText: 'Maria' },
    ])

    expect(mentions).toHaveLength(2)
    expect(getMentionedUserIds('fala @Maria', mentions)).toEqual(['u3'])
  })
})
