import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from './guards/AuthGuard'
import { AdminGuard } from './guards/AdminGuard'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

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
    ],
  },
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { HomePage } = await import('@/pages/home/HomePage')
              return { Component: HomePage }
            },
          },
          {
            path: 'matches',
            lazy: async () => {
              const { MatchesPage } = await import('@/pages/matches/MatchesPage')
              return { Component: MatchesPage }
            },
          },
          {
            path: 'matches/:matchId',
            lazy: async () => {
              const { MatchDetailPage } = await import('@/pages/match-detail/MatchDetailPage')
              return { Component: MatchDetailPage }
            },
          },
          {
            path: 'groups',
            lazy: async () => {
              const { GroupsPage } = await import('@/pages/groups/GroupsPage')
              return { Component: GroupsPage }
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
            path: 'groups/:groupId',
            lazy: async () => {
              const { GroupDetailPage } = await import('@/pages/groups/GroupDetailPage')
              return { Component: GroupDetailPage }
            },
          },
          {
            path: 'groups/:groupId/matches/:matchId',
            lazy: async () => {
              const { MatchDetailPage } = await import('@/pages/match-detail/MatchDetailPage')
              return { Component: MatchDetailPage }
            },
          },
          {
            path: 'groups/:groupId/settings',
            lazy: async () => {
              const { GroupSettingsPage } = await import('@/pages/groups/GroupSettingsPage')
              return { Component: GroupSettingsPage }
            },
          },
          {
            path: 'profile',
            lazy: async () => {
              const { ProfilePage } = await import('@/pages/profile/ProfilePage')
              return { Component: ProfilePage }
            },
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
