/**
 * Client-side cache for team base64 flags.
 *
 * Protocol:
 * - Every GET request includes `x-betabet-cached-flags: <id>:<version>,...`
 *   for each flag already stored here.
 * - The backend omits the base64 data (`flagUrl: ""`) for those entries,
 *   keeping `flagVersion` populated so we can restore the value from cache.
 * - `applyFlagCacheToResponse(json)` runs on every API response: it stores
 *   new flags (non-empty flagUrl + flagVersion) and fills back empty flagUrl
 *   values from the cache before the data reaches any React component.
 *
 * Storage: localStorage (persistent across tab/window closes and full app
 * re-entries, so cached flags load instantly instead of being refetched from
 * the API every session). Team flags are public, non-personal data, so there is
 * no LGPD concern with long-term retention; LRU eviction + quota handling below
 * keep the footprint bounded.
 */

const STORAGE_KEY = 'betabet:flag-cache:v1'
const MAX_ENTRIES = 200
const MAX_HEADER_ENTRIES = 200

type CacheEntry = {
  v: string  // flagVersion (ms since epoch as string)
  d: string  // full data URI
  t: number  // last-touched epoch ms (LRU eviction)
}

type CacheShape = Record<string, CacheEntry>

let memoryCache: CacheShape | null = null

function getStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

function load(): CacheShape {
  if (memoryCache !== null) return memoryCache
  const storage = getStorage()
  if (!storage) {
    memoryCache = {}
    return memoryCache
  }
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CacheShape
      memoryCache = parsed && typeof parsed === 'object' ? parsed : {}
    } else {
      memoryCache = {}
    }
  } catch {
    memoryCache = {}
  }
  return memoryCache
}

function persist(): void {
  const storage = getStorage()
  if (!memoryCache || !storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(memoryCache))
  } catch {
    // Quota hit — evict oldest quarter and retry once.
    evict(Math.max(1, Math.ceil(Object.keys(memoryCache).length / 4)))
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(memoryCache))
    } catch {
      // Give up: data stays in memoryCache for this session only.
    }
  }
}

function evict(count: number): void {
  if (!memoryCache) return
  const entries = Object.entries(memoryCache)
  entries.sort((a, b) => a[1].t - b[1].t)
  for (let i = 0; i < count && i < entries.length; i++) {
    delete memoryCache[entries[i][0]]
  }
}

export function getCachedFlag(teamId: string): { version: string; dataUri: string } | null {
  const cache = load()
  const hit = cache[teamId]
  if (!hit) return null
  return { version: hit.v, dataUri: hit.d }
}

export function setCachedFlag(teamId: string, version: string, dataUri: string): void {
  const cache = load()
  const existing = cache[teamId]
  if (existing && existing.v === version && existing.d === dataUri) {
    existing.t = Date.now()
    persist()
    return
  }
  cache[teamId] = { v: version, d: dataUri, t: Date.now() }
  if (Object.keys(cache).length > MAX_ENTRIES) {
    evict(Object.keys(cache).length - MAX_ENTRIES)
  }
  persist()
}

/**
 * Header value for `x-betabet-cached-flags`, or `null` if the cache is empty.
 * Format: `<teamId>:<version>,...` (both are digit strings).
 */
export function buildFlagCacheHeader(): string | null {
  const cache = load()
  const entries = Object.entries(cache)
  if (entries.length === 0) return null
  entries.sort((a, b) => b[1].t - a[1].t)
  const parts: string[] = []
  for (const [id, entry] of entries) {
    if (parts.length >= MAX_HEADER_ENTRIES) break
    if (!/^\d+$/.test(id) || !/^\d+$/.test(entry.v)) continue
    parts.push(`${id}:${entry.v}`)
  }
  return parts.length > 0 ? parts.join(',') : null
}

export function clearFlagCache(): void {
  memoryCache = {}
  const storage = getStorage()
  if (storage) {
    try { storage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }
}

/**
 * Walk an API response in-place and apply flag-cache logic:
 *  - Team-shaped objects with a non-empty `flagUrl` + `flagVersion` → stored in cache.
 *  - Team-shaped objects with empty `flagUrl` + `flagVersion` matching cache → `flagUrl`
 *    filled with the cached data URI so all consumers see the resolved image.
 *
 * "Team-shaped" = plain object with string `id`, string `flagUrl`, and
 * `flagVersion` being string | null.
 */
export function applyFlagCacheToResponse(value: unknown): void {
  if (value == null) return
  if (Array.isArray(value)) {
    for (const item of value) applyFlagCacheToResponse(item)
    return
  }
  if (typeof value !== 'object') return

  const obj = value as Record<string, unknown>
  if (isTeamShape(obj)) {
    handleTeamObject(obj)
  }
  for (const key of Object.keys(obj)) {
    const child = obj[key]
    if (child && (typeof child === 'object' || Array.isArray(child))) {
      applyFlagCacheToResponse(child)
    }
  }
}

function isTeamShape(obj: Record<string, unknown>): boolean {
  return (
    typeof obj.id === 'string' &&
    typeof obj.flagUrl === 'string' &&
    (obj.flagVersion === null || typeof obj.flagVersion === 'string')
  )
}

function handleTeamObject(team: Record<string, unknown>): void {
  const id = team.id as string
  const flagUrl = team.flagUrl as string
  const flagVersion = team.flagVersion as string | null

  if (!flagVersion) return // no stored flag — nothing to do

  if (flagUrl) {
    // Server returned the full data URI → cache it.
    setCachedFlag(id, flagVersion, flagUrl)
    return
  }

  // Server said "you have it cached" — restore from our cache.
  const cached = getCachedFlag(id)
  if (cached && cached.version === flagVersion) {
    team.flagUrl = cached.dataUri
    return
  }

  // Cache miss after server assumed we had it (e.g. storage was cleared).
  // Leave flagUrl empty — the server will resend on the next uncached request
  // because we won't include this teamId in the next cache header.
  // NOTE: the <img src=""> will fail visually; the user just needs to reload once.
}
