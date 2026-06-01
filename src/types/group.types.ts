import type { User } from './auth.types'

export type GroupRole = 'admin' | 'member'
export type JoinMode = 'invite' | 'request'

export interface BettingGroup {
  id: string
  name: string
  emoji: string | null
  coverUrl: string | null
  adminId: string
  resultPoints: number
  exactScorePoints: number
  championBetEnabled: boolean
  championFirstPoints: number
  championSecondPoints: number
  showBetsBeforeKickoff: boolean
  joinMode: JoinMode
  memberCount: number
  inviteCode: string
  createdAt: string
}

export interface GroupMembership {
  groupId: string
  userId: string
  role: GroupRole
  joinedAt: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
}

export interface RankingEntry {
  userId: string
  userName: string
  avatarUrl: string | null
  position: number
  totalPoints: number
  exactScorePredictions: number
  totalBets: number
}

export interface JoinRequest {
  id: string
  groupId: string
  userId: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
  createdAt: string
}

export interface MyJoinRequest {
  id: string
  groupId: string
  groupName: string
  groupEmoji: string | null
  groupCoverUrl: string | null
  createdAt: string
}

export type InvitePreviewGroup = Pick<
  BettingGroup,
  'id' | 'name' | 'emoji' | 'coverUrl' | 'memberCount' | 'joinMode'
>

export interface CreateGroupData {
  name: string
  emoji?: string
  coverUrl?: string
  resultPoints?: number
  exactScorePoints?: number
  championBetEnabled?: boolean
  championFirstPoints?: number
  championSecondPoints?: number
  joinMode?: JoinMode
}

export interface UpdateGroupData extends Partial<CreateGroupData> {}

export type SidebarDestination =
  | 'home'
  | 'jogos'
  | 'palpites'
  | 'ranking'
  | 'membros'
  | 'configuracoes'

export interface SidebarItem {
  id: SidebarDestination
  label: string
  to: string
  iconName: string
  adminOnly: boolean
}

export interface LeaveGroupResult {
  ok: boolean
}
