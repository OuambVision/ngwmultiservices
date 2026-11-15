import { describe, expect, it } from 'vitest'

import { expandTimeRange, timeToMinutes } from '../lib/calendar'

describe('expandTimeRange', () => {
  it('expands a full workday into hourly starts', () => {
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

  it('supports 30-minute slots', () => {
    expect(expandTimeRange('09:00', '11:00', 30)).toEqual(['09:00', '09:30', '10:00', '10:30'])
  })

  it('returns empty when end is before start', () => {
    expect(expandTimeRange('12:00', '10:00', 60)).toEqual([])
  })
})

describe('timeToMinutes', () => {
  it('parses HH:mm', () => {
    expect(timeToMinutes('08:30')).toBe(510)
    expect(timeToMinutes('bad')).toBeNull()
  })
})
