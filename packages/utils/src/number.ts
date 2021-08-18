import {
  number,
} from '@bugfixes/i18n-formats'

/**
 * Format a number according to language conventions.
 *
 * @param locale - A string with a BCP 47 language tag
 * @param value - A numeric value to format
 * @param options - Format options compatible with the `Intl.NumberFormat` constructor
 * @returns A number formatted according to language conventions
 * @public
 *
 * @example
 * ```javascript
 * import { formatNumber } from '@bugfixes/i18n-utils'
 *
 * const result = formatNumber('en-GB', 1200)
 * // '1,200'
 * ```
 */
export function formatNumber(
  locale: string,
  value: number,
  options: Intl.NumberFormatOptions = number.default,
): string {
  const { signDisplay, ...opts } = options

  const output = new Intl.NumberFormat(locale, {
    ...opts,
    style: 'decimal',
  }).format(Math.abs(value))

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
