import {
  formatPercentage,
} from '../src'

describe('formatPercentage()', function () {
  test('formats a percentage for a given locale with defaults', function () {
    const input = 0.125
    const output = formatPercentage('en-GB', input)

    expect(output).toBe('12.5%')
  })

  test('formats a percentage for a given locale with custom options', function () {
    const input = 0.125
    const output = formatPercentage('en-GB', input, {
      minimumFractionDigits: 2,
    })

    expect(output).toBe('12.50%')
  })
})
