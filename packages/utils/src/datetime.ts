import {
  date,
} from '@bugfixes/i18n-formats'

/**
 * Format a date and time according to language conventions.
 *
 * @remarks By default only a date will be returned, use the options to provide the time format
 * @param locale - A string with a BCP 47 language tag
 * @param value - A date object to format
 * @param options - Format options compatible with the `Intl.DateTimeFormat` constructor
 * @returns A date and time formatted according to language conventions
 * @public
 *
 * @example
 * ```javascript
 * import { formatDateTime } from '@bugfixes/i18n-utils'
 *
 * const result = formatDateTime('en-GB', new Date())
 * // '17/12/2020'
 * ```
 */
export function formatDateTime(
  locale: string,
  value: Date,
  options: Intl.DateTimeFormatOptions = date.default,
): string {
  return new Intl.DateTimeFormat(locale, options).format(value)
}

/**
 * Format a date and time according to language conventions and universal time.
 *
 * @remarks By default only a date will be returned, use the options to provide the time format
 * @param locale - A string with a BCP 47 language tag
 * @param value - A date object to format
 * @param options - Format options compatible with the `Intl.DateTimeFormat` constructor
 * @returns A date and time formatted according to language conventions and universal time
 * @public
 *
 * @example
 * ```javascript
 * import { formatDateTime } from '@bugfixes/i18n-utils'
 *
 * const result = formatDateTime('en-GB', new Date())
 * // '17/12/2020'
 * ```
 */
export function formatUTCDateTime(
  locale: string,
  value: Date,
  options: Intl.DateTimeFormatOptions = date.default,
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: 'UTC',
  }).format(value)
}
