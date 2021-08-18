import {
  formatCurrency,
} from '../src'

describe('formatCurrency()', function () {
  test('formats a currency for a given locale with defaults', function () {
    const input = 12.5
    const output = formatCurrency('en-GB', input)

    expect(output).toBe('$12.50')
  })

  test('formats a specific currency for a given locale with defaults', function () {
    const input = 12.5
    const output = formatCurrency('en-GB', input, 'GBP')

    expect(output).toBe('£12.50')
  })

  test('formats a specific currency for a given locale with custom options', function () {
    const input = 12.5
    const output = formatCurrency('en-GB', input, 'USD', {
      currencyDisplay: 'symbol',
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    })

    expect(output).toBe('US$12.5')
  })

  test('formats a specific currency for a given locale with a narrow symbol currency display', function () {
    const input = 12.5
    const output = formatCurrency('en-GB', input, 'USD', {
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    })

    expect(output).toBe('$12.5')
  })

  test('formats a currency for a given locale when using the `auto` value for the `signDisplay` option', function () {
    const outputA = formatCurrency('en-GB', -1.25, 'GBP', {
      signDisplay: 'auto',
    })
    const outputB = formatCurrency('en-GB', 0, 'GBP', {
      signDisplay: 'auto',
    })
    const outputC = formatCurrency('en-GB', 1.25, 'GBP', {
      signDisplay: 'auto',
    })

    expect(outputA).toBe('-£1.25')
    expect(outputB).toBe('£0.00')
    expect(outputC).toBe('£1.25')
  })

  test('formats a currency for a given locale when using the `never` value for the `signDisplay` option', function () {
    const outputA = formatCurrency('en-GB', -1.25, 'GBP', {
      signDisplay: 'never',
    })
    const outputB = formatCurrency('en-GB', 0, 'GBP', {
      signDisplay: 'never',
    })
    const outputC = formatCurrency('en-GB', 1.25, 'GBP', {
      signDisplay: 'never',
    })

    expect(outputA).toBe('£1.25')
    expect(outputB).toBe('£0.00')
    expect(outputC).toBe('£1.25')
  })

  test('formats a currency for a given locale when using the `always` value for the `signDisplay` option', function () {
    const outputA = formatCurrency('en-GB', -1.25, 'GBP', {
      signDisplay: 'always',
    })
    const outputB = formatCurrency('en-GB', 0, 'GBP', {
      signDisplay: 'always',
    })
    const outputC = formatCurrency('en-GB', 1.25, 'GBP', {
      signDisplay: 'always',
    })

    expect(outputA).toBe('-£1.25')
    expect(outputB).toBe('+£0.00')
    expect(outputC).toBe('+£1.25')
  })

  test('formats a currency for a given locale when using the `exceptZero` value for the `signDisplay` option', function () {
    const outputA = formatCurrency('en-GB', -1.25, 'GBP', {
      signDisplay: 'exceptZero',
    })
    const outputB = formatCurrency('en-GB', 0, 'GBP', {
      signDisplay: 'exceptZero',
    })
    const outputC = formatCurrency('en-GB', 1.25, 'GBP', {
      signDisplay: 'exceptZero',
    })

    expect(outputA).toBe('-£1.25')
    expect(outputB).toBe('£0.00')
    expect(outputC).toBe('+£1.25')
  })
})
