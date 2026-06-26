import type { SidebarItem } from '@/types/group.types'

export const sidebarDestinations: SidebarItem[] = [
  { id: 'home', label: 'Home', to: '', iconName: 'home', adminOnly: false },
  { id: 'jogos', label: 'Jogos', to: 'jogos', iconName: 'trophy', adminOnly: false },
  {
    id: 'palpites',
    label: 'Palpites',
    to: 'palpites',
    iconName: 'message-square',
    adminOnly: false,
  },
  { id: 'ranking', label: 'Ranking', to: 'ranking', iconName: 'award', adminOnly: false },
  {
    id: 'configuracoes',
    label: 'Configurações',
    to: 'configuracoes',
    iconName: 'settings',
    adminOnly: true,
  },
]

export function pathFor(groupId: string, item: SidebarItem): string {
  return item.to ? `/groups/${groupId}/${item.to}` : `/groups/${groupId}`
}
