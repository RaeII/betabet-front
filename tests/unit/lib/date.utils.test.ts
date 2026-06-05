import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isBetEditable, minutesUntilKickoff, formatCountdown } from '@/lib/date.utils'

describe('minutesUntilKickoff', () => {
  it('returns positive minutes for future kickoff', () => {
    const future = new Date(Date.now() + 60 * 60_000).toISOString()
    // Allow ±1 due to millisecond rounding
    expect(minutesUntilKickoff(future)).toBeGreaterThanOrEqual(59)
    expect(minutesUntilKickoff(future)).toBeLessThanOrEqual(60)
  })

  it('returns negative minutes for past kickoff', () => {
    const past = new Date(Date.now() - 30 * 60_000).toISOString()
    expect(minutesUntilKickoff(past)).toBeGreaterThanOrEqual(-31)
    expect(minutesUntilKickoff(past)).toBeLessThanOrEqual(-30)
  })
})

describe('isBetEditable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true when > 15 minutes before kickoff', () => {
    const kickoff = new Date('2026-06-01T12:16:00Z').toISOString()
    expect(isBetEditable(kickoff)).toBe(true)
  })

  it('returns false when exactly 15 minutes before kickoff', () => {
    const kickoff = new Date('2026-06-01T12:15:00Z').toISOString()
    expect(isBetEditable(kickoff)).toBe(false)
  })

  it('returns false when < 15 minutes before kickoff', () => {
    const kickoff = new Date('2026-06-01T12:10:00Z').toISOString()
    expect(isBetEditable(kickoff)).toBe(false)
  })

  it('returns false when match is in the past', () => {
    const past = new Date('2026-06-01T11:00:00Z').toISOString()
    expect(isBetEditable(past)).toBe(false)
  })
})

describe('formatCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Iniciado" for past kickoff', () => {
    const past = new Date('2026-06-01T11:00:00Z').toISOString()
    expect(formatCountdown(past)).toBe('Iniciado')
  })

  it('returns minutes only when < 60 minutes away', () => {
    const soon = new Date('2026-06-01T12:30:00Z').toISOString()
    expect(formatCountdown(soon)).toBe('30min')
  })

  it('returns hours when >= 60 minutes away and no remainder', () => {
    const twoHours = new Date('2026-06-01T14:00:00Z').toISOString()
    expect(formatCountdown(twoHours)).toBe('2h')
  })

  it('returns hours and minutes for mixed duration', () => {
    const ninetyMin = new Date('2026-06-01T13:30:00Z').toISOString()
    expect(formatCountdown(ninetyMin)).toBe('1h 30min')
  })

  it('returns singular day when exactly one day away', () => {
    const oneDay = new Date('2026-06-02T12:00:00Z').toISOString()
    expect(formatCountdown(oneDay)).toBe('1 dia')
  })

  it('returns days when more than one day away', () => {
    const twoDays = new Date('2026-06-03T12:00:00Z').toISOString()
    expect(formatCountdown(twoDays)).toBe('2 dias')
  })
})
