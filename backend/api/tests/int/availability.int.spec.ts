import { describe, expect, it } from 'vitest'

import { expandTimeRange, timeToMinutes } from '../../src/lib/calendar'

describe('availability slot expansion', () => {
  it('builds hourly starts for a workday range', () => {
    expect(expandTimeRange('08:00', '17:00', 60)).toEqual([
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
    ])
  })

  it('builds 30-minute starts', () => {
    expect(expandTimeRange('09:00', '11:00', 30)).toEqual(['09:00', '09:30', '10:00', '10:30'])
  })

  it('rejects inverted ranges', () => {
    expect(expandTimeRange('12:00', '10:00', 60)).toEqual([])
  })

  it('parses times', () => {
    expect(timeToMinutes('08:30')).toBe(510)
    expect(timeToMinutes('xx')).toBeNull()
  })
})
