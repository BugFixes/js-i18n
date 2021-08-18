import {
  formatDateTime,
  formatUTCDateTime,
} from '../src'

describe('formatDateTime()', function () {
  beforeAll(function () {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2020-12-17T12:00:00.000Z'))
  })

  afterAll(function () {
    jest.useRealTimers()
  })

  test('formats a date for a given locale with defaults', function () {
    const input = new Date('2020-12-17T22:10:00.000+09:00')
    const output = formatDateTime('en-GB', input)

    expect(output).toBe('17/12/2020')
  })

  test('formats a date for a given locale with custom options', function () {
    const input = new Date('2020-12-17T22:10:00.000+09:00')
    const output = formatDateTime('en-GB', input, {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      second: '2-digit',
      year: 'numeric',
    })

    expect(output).toBe('17/12/2020, 14:10:00')
  })
})

describe('formatUTCDateTime()', function () {
  beforeAll(function () {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2020-12-17T12:00:00.000Z'))
  })

  afterAll(function () {
    jest.useRealTimers()
  })

  test('formats a date for a given locale in UTC with defaults', function () {
    const input = new Date('2020-12-17T22:10:00.000+09:00')
    const output = formatUTCDateTime('en-GB', input)

    expect(output).toBe('17/12/2020')
  })

  test('formats a date for a given locale in UTC with custom options', function () {
    const input = new Date('2020-12-17T22:10:00.000+09:00')
    const output = formatUTCDateTime('en-GB', input, {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      second: '2-digit',
      year: 'numeric',
    })

    expect(output).toBe('17/12/2020, 13:10:00')
  })
})
