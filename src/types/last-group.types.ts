export interface LastAccessedGroupResolution {
  groupId: string | null
  isReady: boolean
  reason: 'single' | 'stored' | 'fallback' | 'none'
}
