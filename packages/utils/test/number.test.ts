import {
  formatNumber,
} from '../src'

describe('formatNumber()', function () {
  test('formats a number for a given locale with defaults', function () {
    const input = 1200.5
    const output = formatNumber('en-GB', input)

    expect(output).toBe('1,200.5')
  })

  test('formats a number for a given locale with custom options', function () {
    const input = 12.5
    const output = formatNumber('en-GB', input, {
      minimumFractionDigits: 2,
    })

    expect(output).toBe('12.50')
  })

  test('formats a number for a given locale when using the `auto` value for the `signDisplay` option', function () {
    const outputA = formatNumber('en-GB', -1.25, {
      signDisplay: 'auto',
    })
    const outputB = formatNumber('en-GB', 0, {
      signDisplay: 'auto',
    })
    const outputC = formatNumber('en-GB', 1.25, {
      signDisplay: 'auto',
    })

    expect(outputA).toBe('-1.25')
    expect(outputB).toBe('0')
    expect(outputC).toBe('1.25')
  })

  test('formats a number for a given locale when using the `never` value for the `signDisplay` option', function () {
    const outputA = formatNumber('en-GB', -1.25, {
      signDisplay: 'never',
    })
    const outputB = formatNumber('en-GB', 0, {
      signDisplay: 'never',
    })
    const outputC = formatNumber('en-GB', 1.25, {
      signDisplay: 'never',
    })

    expect(outputA).toBe('1.25')
    expect(outputB).toBe('0')
    expect(outputC).toBe('1.25')
  })

  test('formats a number for a given locale when using the `always` value for the `signDisplay` option', function () {
    const outputA = formatNumber('en-GB', -1.25, {
      signDisplay: 'always',
    })
    const outputB = formatNumber('en-GB', 0, {
      signDisplay: 'always',
    })
    const outputC = formatNumber('en-GB', 1.25, {
      signDisplay: 'always',
    })

    expect(outputA).toBe('-1.25')
    expect(outputB).toBe('+0')
    expect(outputC).toBe('+1.25')
  })

  test('formats a number for a given locale when using the `exceptZero` value for the `signDisplay` option', function () {
    const outputA = formatNumber('en-GB', -1.25, {
      signDisplay: 'exceptZero',
    })
    const outputB = formatNumber('en-GB', 0, {
      signDisplay: 'exceptZero',
    })
    const outputC = formatNumber('en-GB', 1.25, {
      signDisplay: 'exceptZero',
    })

    expect(outputA).toBe('-1.25')
    expect(outputB).toBe('0')
    expect(outputC).toBe('+1.25')
  })
})
