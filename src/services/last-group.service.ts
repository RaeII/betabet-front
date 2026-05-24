const KEY = (userId: string) => `betabet:last-group:${userId}`

export function getLastAccessedGroup(userId: string): string | null {
  try {
    return localStorage.getItem(KEY(userId))
  } catch {
    return null
  }
}

export function setLastAccessedGroup(userId: string, groupId: string): void {
  try {
    localStorage.setItem(KEY(userId), groupId)
  } catch {
    /* ignore */
  }
}

export function clearLastAccessedGroup(userId: string): void {
  try {
    localStorage.removeItem(KEY(userId))
  } catch {
    /* ignore */
  }
}
