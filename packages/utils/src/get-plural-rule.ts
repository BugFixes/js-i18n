type PluralRuleFns = {
  [locale: string]: (n: number, ord: boolean)=> Intl.LDMLPluralRule,
}

const pluralRuleFns: PluralRuleFns = {
  /**
   * Get the pluralization category for English.
   *
   * @param n - The number to get a plural rule for
   * @param ordinal - Set to `true` to treat the number as ordinal rather than cardinal
   * @returns The pluralization category of the number
   */
  en(n: number, ordinal: boolean): Intl.LDMLPluralRule {
    const s = String(n).split('.')
    const v0 = !s[1]
    const t0 = Number(s[0]) === n
    const n10 = t0 && s[0].slice(-1)
    const n100 = t0 && s[0].slice(-2)

    if (ordinal) {
      if (n10 === '1' && n100 !== '11') {
        return 'one'
      } else if (n10 === '2' && n100 !== '12') {
        return 'two'
      } else if (n10 === '3' && n100 !== '13') {
        return 'few'
      }

      return 'other'
    }

    return n === 1 && v0 ? 'one' : 'other'
  },
}

/**
 * Get which plural or ordinal rule to use for locale-aware formatting.
 *
 * @param locale - A string with a BCP 47 language tag
 * @param value - The number to get a plural rule for
 * @param ordinal - Set to `true` to treat the number as ordinal rather than cardinal
 * @returns The pluralization or ordinal category of the number
 * @public
 *
 * @example
 * ```javascript
 * import { getPluralRule } from '@bugfixes/i18n-utils'
 *
 * const result = getPluralRule('en-GB', 1)
 * // 'one'
 * ```
 */
export function getPluralRule(
  locale: string,
  value: number,
  ordinal?: boolean,
): Intl.LDMLPluralRule {
  const useOrdinal = ordinal === true

  if (typeof Intl.PluralRules !== 'undefined') {
    return new Intl.PluralRules(locale, {
      type: useOrdinal ? 'ordinal' : 'cardinal',
    }).select(value)
  }

  // Default to a polyfill if available
  const pluralRuleFn = pluralRuleFns[locale] ?? pluralRuleFns[locale.split('-')[0]] // eslint-disable-line @typescript-eslint/no-unnecessary-condition

  if (typeof pluralRuleFn !== 'undefined') {
    return pluralRuleFn(value, useOrdinal)
  }

  // Including polyfills for all languages would cause a lot of bloat, we only support specific languages in use at Bud
  throw new Error(`Unsupported locale: ${locale}`)
}
