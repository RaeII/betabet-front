import { createBrowserRouter } from 'react-router-dom'
import { GroupShell } from '@/components/layout/GroupShell'
import { AuthGuard } from './guards/AuthGuard'
import { AdminGuard } from './guards/AdminGuard'
import { OnboardingGuard } from './guards/OnboardingGuard'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { RootResolver } from './RootResolver'

export const router = createBrowserRouter([
  {
    path: '/auth',
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/admin/login',
    lazy: async () => {
      const { AdminLoginPage } = await import('@/pages/admin/AdminLoginPage')
      return { Component: AdminLoginPage }
    },
  },
  {
    path: '/admin',
    element: <AdminGuard />,
    children: [
      {
        path: '',
        lazy: async () => {
          const { AdminShell } = await import('@/pages/admin/AdminShell')
          return { Component: AdminShell }
        },
        children: [
          {
            index: true,
            lazy: async () => {
              const { AdminDashboardPage } = await import('@/pages/admin/AdminDashboardPage')
              return { Component: AdminDashboardPage }
            },
          },
          {
            path: 'matches',
            lazy: async () => {
              const { AdminMatchesPage } = await import('@/pages/admin/AdminMatchesPage')
              return { Component: AdminMatchesPage }
            },
          },
          {
            path: 'teams',
            lazy: async () => {
              const { AdminTeamsPage } = await import('@/pages/admin/AdminTeamsPage')
              return { Component: AdminTeamsPage }
            },
          },
          {
            path: 'import/teams',
            lazy: async () => {
              const { AdminImportTeamsPage } = await import('@/pages/admin/AdminImportTeamsPage')
              return { Component: AdminImportTeamsPage }
            },
          },
          {
            path: 'import/matches',
            lazy: async () => {
              const { AdminImportMatchesPage } = await import('@/pages/admin/AdminImportMatchesPage')
              return { Component: AdminImportMatchesPage }
            },
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        path: 'onboarding',
        lazy: async () => {
          const { OnboardingPage } = await import('@/pages/onboarding/OnboardingPage')
          return { Component: OnboardingPage }
        },
      },
      {
        path: 'onboarding/join',
        lazy: async () => {
          const { JoinGroupPage } = await import('@/pages/onboarding/JoinGroupPage')
          return { Component: JoinGroupPage }
        },
      },
      {
        path: 'groups/new',
        lazy: async () => {
          const { CreateGroupPage } = await import('@/pages/groups/CreateGroupPage')
          return { Component: CreateGroupPage }
        },
      },
      {
        element: <OnboardingGuard />,
        children: [
          {
            path: 'profile',
            element: <GroupShell />,
            children: [
              {
                index: true,
                lazy: async () => {
                  const { ProfilePage } = await import('@/pages/profile/ProfilePage')
                  return { Component: ProfilePage }
                },
              },
            ],
          },
          {
            index: true,
            element: <RootResolver />,
          },
          {
            path: 'groups/:groupId',
            element: <GroupShell />,
            children: [
              {
                index: true,
                lazy: async () => {
                  const { HomePage } = await import('@/pages/home/HomePage')
                  return { Component: HomePage }
                },
              },
              {
                path: 'jogos',
                lazy: async () => {
                  const { GroupJogosPage } = await import('@/pages/groups/GroupJogosPage')
                  return { Component: GroupJogosPage }
                },
              },
              {
                path: 'palpites',
                lazy: async () => {
                  const { GroupPalpitesPage } = await import('@/pages/groups/GroupPalpitesPage')
                  return { Component: GroupPalpitesPage }
                },
              },
              {
                path: 'ranking',
                lazy: async () => {
                  const { GroupRankingPage } = await import('@/pages/groups/GroupRankingPage')
                  return { Component: GroupRankingPage }
                },
              },
              {
                path: 'membros',
                lazy: async () => {
                  const { GroupMembersPage } = await import('@/pages/groups/GroupMembersPage')
                  return { Component: GroupMembersPage }
                },
              },
              {
                path: 'configuracoes',
                lazy: async () => {
                  const { GroupSettingsPage } = await import('@/pages/groups/GroupSettingsPage')
                  return { Component: GroupSettingsPage }
                },
              },
              {
                path: 'detalhes',
                lazy: async () => {
                  const { GroupDetailsPage } = await import('@/pages/groups/GroupDetailsPage')
                  return { Component: GroupDetailsPage }
                },
              },
              {
                path: 'matches/:matchId',
                lazy: async () => {
                  const { MatchDetailPage } = await import('@/pages/match-detail/MatchDetailPage')
                  return { Component: MatchDetailPage }
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'invite/:code',
    lazy: async () => {
      const { InvitePage } = await import('@/pages/invite/InvitePage')
      return { Component: InvitePage }
    },
  },
])
