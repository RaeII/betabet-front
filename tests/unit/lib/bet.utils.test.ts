import { describe, it, expect } from 'vitest'
import { deriveBetOutcome, calcPoints } from '@/lib/bet.utils'

const group = { resultPoints: 1, exactScorePoints: 3 }

describe('deriveBetOutcome', () => {
  it('returns "home" when home score is higher', () => {
    expect(deriveBetOutcome(2, 0)).toBe('home')
  })

  it('returns "away" when away score is higher', () => {
    expect(deriveBetOutcome(0, 1)).toBe('away')
  })

  it('returns "draw" when scores are equal', () => {
    expect(deriveBetOutcome(1, 1)).toBe('draw')
    expect(deriveBetOutcome(0, 0)).toBe('draw')
  })
})

describe('calcPoints', () => {
  it('awards resultPoints + exactScorePoints for exact score match', () => {
    expect(calcPoints(2, 1, 2, 1, group)).toBe(4)
  })

  it('awards only resultPoints for correct result but wrong score', () => {
    expect(calcPoints(3, 0, 1, 0, group)).toBe(1)
  })

  it('awards only resultPoints for correct draw result but wrong score', () => {
    expect(calcPoints(1, 1, 2, 2, group)).toBe(1)
  })

  it('awards 0 points for wrong result', () => {
    expect(calcPoints(1, 0, 0, 1, group)).toBe(0)
  })

  it('awards 0 points when bet is draw but match is home win', () => {
    expect(calcPoints(1, 1, 2, 0, group)).toBe(0)
  })
})
