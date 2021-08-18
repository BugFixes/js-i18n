import {
  number,
} from '@bugfixes/i18n-formats'

const currencyCodeRegEx = /[a-z]+/i

/**
 * Format a currency value according to language conventions.
 *
 * @param locale - A string with a BCP 47 language tag
 * @param value - A currency amount to format
 * @param currency - The ISO 4217 currency code in which the value is to be represented
 * @param options - Format options compatible with the `Intl.NumberFormat` constructor
 * @returns A currency value formatted according to language conventions
 * @public
 *
 * @example
 * ```javascript
 * import { formatCurrency } from '@bugfixes/i18n-utils'
 *
 * const result = formatCurrency('en-GB', 12.5, 'GBP')
 * // '£12.50'
 * ```
 */
export function formatCurrency(
  locale: string,
  value: number,
  currency: string = 'USD',
  options: Intl.NumberFormatOptions = number.currency,
): string {
  const { currencyDisplay, signDisplay, ...opts } = options
  const prefersNarrowSymbol = currencyDisplay === 'narrowSymbol'

  opts.currency = currency

  // @ts-expect-error The property is a valid option but TypeScript is building its type without it
  opts.currencyDisplay = currencyDisplay === 'narrowSymbol' ? 'symbol' : currencyDisplay // Get around an issue with Safari and other browsers that don't support the `narrowSymbol` value for the `currencyDisplay` option
  opts.style = 'currency'

  let output = new Intl.NumberFormat(locale, opts).format(Math.abs(value))

  output = prefersNarrowSymbol ? output.replace(currencyCodeRegEx, '') : output

  // Get around an issue with Safari and other browsers that don't support the `signDisplay` option
  if (signDisplay === 'never') {
    return output
  } else if (signDisplay === 'always') {
    return value < 0 ? `-${output}` : `+${output}`
  } else if (signDisplay === 'exceptZero') {
    if (value === 0) {
      return output
    }

    return value < 0 ? `-${output}` : `+${output}`
  }

  return value < 0 ? `-${output}` : output
}
