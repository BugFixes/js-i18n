import {
  number,
} from '@bugfixes/i18n-formats'

/**
 * Format a percentage value according to language conventions.
 *
 * @param locale - A string with a BCP 47 language tag
 * @param value - A numeric value to format with `1` being equivalent to 100%
 * @param options - Format options compatible with the `Intl.NumberFormat` constructor
 * @returns A percentage value formatted according to language conventions
 * @public
 *
 * @example
 * ```javascript
 * import { formatPercentage } from '@bugfixes/i18n-utils'
 *
 * const result = formatPercentage('en-GB', 0.125)
 * // '12.5%'
 * ```
 */
export function formatPercentage(
  locale: string,
  value: number,
  options: Intl.NumberFormatOptions = number.percent,
): string {
  return new Intl.NumberFormat(locale, {
    ...options,
    style: 'percent',
  }).format(value)
}
