import {
  deflate,
} from '@bugfixes/object-utils'
import {
  date,
  number,
} from '@bugfixes/i18n-formats'
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercentage,
  formatUTCDateTime,
  getPluralRule,
} from '@bugfixes/i18n-utils'
import parse from './utils/parser'
import interpret from './utils/interpreter'
import type { Expression } from './utils/parser'

export type I18nSelectType = 'plural' | 'ordinal' | 'key'

export type I18nSelectPhrases = {
  [key: string]: string,
}

export type I18nSelectPluralPhrases = {[key in Intl.LDMLPluralRule]?: string } & {
  default?: string,
}

export type I18nFormatOptions = {
  currency?: {
    [formatKey: string]: Intl.NumberFormatOptions,
  },
  date?: {
    [formatKey: string]: Intl.DateTimeFormatOptions,
  },
  number?: {
    [formatKey: string]: Intl.NumberFormatOptions,
  },
  percentage?: {
    [formatKey: string]: Intl.NumberFormatOptions,
  },
}

export type I18nTranslations = {
  [key: string]: string | I18nTranslations,
}

export type I18nInterpolationContext = {
  [key: string]: any,
}

export type I18nOptions = {
  defaultContext?: I18nInterpolationContext,
  formats?: I18nFormatOptions,
  translations?: I18nTranslations,
}

type I18nTranslationsStore = {
  [key: string]: string,
}

type I18nParsedTranslationsStore = {
  [key: string]: Expression[],
}

/**
 * Default handler for missing translations.
 *
 * @param key - The missing translation key
 */
function onMissingTranslation(locale: string, key: string): never {
  throw new Error(`The locale '${locale}' is missing the translation with the key '${key}'`)
}

/**
 * Resolve a given key to the associated translation AST.
 *
 * @param locale - The locale in use for formatting
 * @param key - The translation key to resolve
 * @param translations - Store for the translations associated with the locale in use
 * @param parsedTranslations - Store for already parsed translations associated with the locale in use
 * @returns The translation AST that resulted from resolving the given key
 */
function resolveTranslation(
  locale: string,
  key: string,
  translations: I18nTranslationsStore,
  parsedTranslations: I18nParsedTranslationsStore,
): Expression[] | never {
  if (!translations.hasOwnProperty(key)) {
    return onMissingTranslation(locale, key)
  }

  if (typeof parsedTranslations[key] !== 'undefined') {
    return parsedTranslations[key]
  }

  const translation = parse(translations[key])

  parsedTranslations[key] = translation

  return translation
}

/**
 * Extends the default formats with custom formats.
 *
 * @param formats - Different format settings for different data types
 * @returns The default formats combined with the given custom formats
 */
function extendFormats(formats: I18nFormatOptions = {}): Required<I18nFormatOptions> {
  return {
    currency: {
      default: number.currency,
      ...formats.currency,
    },
    date: {
      default: date.default,
      full: date.full,
      long: date.long,
      medium: date.medium,
      short: date.short,
      ...formats.date,
    },
    number: {
      decimal: number.decimal,
      default: number.default,
      integer: number.integer,
      ...formats.number,
    },
    percentage: {
      default: number.percent,
      ...formats.percentage,
    },
  }
}

export default class I18n {
  /**
   * The locale in use for formatting
   */
  public readonly locale: string

  /**
   * The available formats to use with the data formatting helpers
   */
  public readonly formats: Required<I18nFormatOptions>

  /**
   * Store for the translations associated with the locale
   */
  public readonly translations: I18nTranslationsStore = {}

  /**
   * The local context to use when interpolating translations
   */
  private context: I18nInterpolationContext = {}

  /**
   * Store for the parsed translations associated with the locale
   */
  private parsedTranslations: I18nParsedTranslationsStore = {}

  /**
   * Create an instance of the I18n class which you can use to format data in a specific language and different formats.
   *
   * @param locale - The locale to use for formatting
   * @param options - Customize the way data is formatted
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB', {
   *   translations: {
   *     foobar: 'The quick brown fox jumps over the lazy dog',
   *   },
   * })
   * ```
   */
  constructor(locale: string, options: I18nOptions = {}) {
    const { formats } = options

    this.formats = extendFormats(formats)

    const boundFormatCurrency = this.formatCurrency.bind(this)
    const boundFormatDate = this.formatDate.bind(this)
    const boundFormatNumber = this.formatNumber.bind(this)
    const boundFormatPercentage = this.formatPercentage.bind(this)
    const boundT = this.t.bind(this)
    const boundTToParts = this.tToParts.bind(this)
    const boundFormatUTCDate = this.formatUTCDate.bind(this)
    const boundGetOrdinalRule = this.getOrdinalRule.bind(this)
    const boundGetPluralRule = this.getPluralRule.bind(this)
    const boundSelectPhrase = this.selectPhrase.bind(this)

    this.formatCurrency = boundFormatCurrency
    this.formatDate = boundFormatDate
    this.formatNumber = boundFormatNumber
    this.formatPercentage = boundFormatPercentage
    this.t = boundT
    this.tToParts = boundTToParts
    this.formatUTCDate = boundFormatUTCDate
    this.getOrdinalRule = boundGetOrdinalRule
    this.getPluralRule = boundGetPluralRule
    this.selectPhrase = boundSelectPhrase

    this.locale = locale

    this.extendContext({
      formatCurrency: boundFormatCurrency,
      formatDate: boundFormatDate,
      formatNumber: boundFormatNumber,
      formatPercentage: boundFormatPercentage,
      formatUTCDate: boundFormatUTCDate,
      getOrdinalRule: boundGetOrdinalRule,
      getPluralRule: boundGetPluralRule,
      selectPhrase: boundSelectPhrase,
      t: boundT,
      tToParts: boundTToParts,
      ...options.defaultContext,
    })
    this.extendTranslations({ ...options.translations })
  }

  /**
   * Extends the default interpolation context associated with the I18n instance. New properties can be added and existing properties can be replaced.
   *
   * @param ctx - The interpolation context to extend the existing context with
   * @returns The I18n instance will be returned for chaining
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB').extendContext({ foo: 'bar' })
   * ```
   */
  public extendContext(ctx: I18nInterpolationContext): this {
    const existingCtx = this.context

    this.context = {
      ...existingCtx,
      ...ctx,
    }

    return this
  }

  /**
   * Extends the translations associated with the I18n instance. New translations can be added and existing translations can be replaced.
   *
   * @remarks Objects will be deflated into a shallow object of dot notation keys
   * @param translations - The translations to extend the existing translations with
   * @returns The I18n instance will be returned for chaining
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB').extendTranslations({ foo: 'bar' })
   * ```
   */
  public extendTranslations(translations: I18nTranslations): this {
    const parsedTranslations = this.parsedTranslations

    Object.assign(this.translations, deflate(translations))

    // Delete cached parsed translations being replaced
    Object.keys(translations).forEach(function (key) {
      delete parsedTranslations[key]
    })

    return this
  }

  /**
   * Verify if a given translation exists in the I18n instance.
   *
   * @param key - The translation key to verify the existence of
   * @returns `true` or `false` depending on wether the translation associated with the given key exists or not
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB').extendTranslations({ foo: 'bar' })
   * i18n.hasTranslation('foo') // true
   * i18n.hasTranslation('bar') // false
   * ```
   */
  public hasTranslation(key: string): boolean {
    return this.translations.hasOwnProperty(key)
  }

  /**
   * Format a currency value according to the conventions of the instance's locale.
   *
   * @param value - A currency amount to format
   * @param currency - The ISO 4217 currency code in which the value is to be represented
   * @param format - The key of the format to use when formatting the currency
   * @returns A currency value formatted according to the conventions of the instance's locale
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB')
   * const result = i18n.formatCurrency(12.5, 'GBP')
   * // '£12.50'
   * ```
   */
  public formatCurrency(value: number, currency?: string, format: string = 'default'): string {
    const formatOptions = this.formats.currency[format]

    return formatCurrency(this.locale, value, currency, formatOptions)
  }

  /**
   * Format a date and time according to the conventions of the instance's locale.
   *
   * @param value - A date object to format
   * @param format - The key of the format to use when formatting the date
   * @returns A date formatted according to the conventions of the instance's locale
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB')
   * const result = i18n.formatDate(new Date(), 'short')
   * // '17/12/2020'
   * ```
   */
  public formatDate(value: Date, format: string = 'default'): string {
    const formatOptions = this.formats.date[format]

    return formatDateTime(this.locale, value, formatOptions)
  }

  /**
   * Format a date and time according to the conventions of the instance's locale and universal time.
   *
   * @param value - A date object to format
   * @param format - The key of the format to use when formatting the date
   * @returns A date formatted according to the conventions of the instance's locale and universal time
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB')
   * const result = i18n.formatUTCDate(new Date(), 'short')
   * // '17/12/2020'
   * ```
   */
  public formatUTCDate(value: Date, format: string = 'default'): string {
    const formatOptions = this.formats.date[format]

    return formatUTCDateTime(this.locale, value, formatOptions)
  }

  /**
   * Format a number according to the conventions of the instance's locale.
   *
   * @param value - A numeric value to format
   * @param format - The key of the format to use when formatting the number
   * @returns A number formatted according to the conventions of the instance's locale
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB')
   * const result = i18n.formatNumber(1200, 'integer')
   * // '1,200'
   * ```
   */
  public formatNumber(value: number, format: string = 'default'): string {
    const formatOptions = this.formats.number[format]

    return formatNumber(this.locale, value, formatOptions)
  }

  /**
   * Format a percentage according to the conventions of the instance's locale.
   *
   * @param value - A numeric value to format with `1` being equivalent to 100%
   * @param format - The key of the format to use when formatting the percentage
   * @returns A percentage formatted according to the conventions of the instance's locale
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB')
   * const result = i18n.formatPercentage(0.125)
   * // '12.5%'
   * ```
   */
  public formatPercentage(value: number, format: string = 'default'): string {
    const formatOptions = this.formats.percentage[format]

    return formatPercentage(this.locale, value, formatOptions)
  }

  /**
   * Get which ordinal rule to use for locale-aware formatting.
   *
   * @param value - The number to get an ordinal rule for
   * @returns The ordinal category of the number
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB')
   *
   * const result = i18n.getOrdinalRule(1)
   * // 'one'
   * ```
   */
  public getOrdinalRule(value: number): Intl.LDMLPluralRule {
    return getPluralRule(this.locale, value, true)
  }

  /**
   * Get which plural rule to use for locale-aware formatting.
   *
   * @param value - The number to get a plural rule for
   * @returns The pluralization category of the number
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB')
   *
   * const result = i18n.getPluralRule(1)
   * // 'one'
   * ```
   */
  public getPluralRule(value: number): Intl.LDMLPluralRule {
    return getPluralRule(this.locale, value, false)
  }

  /**
   * Select a phrase from an object based on a key or value.
   *
   * @remarks When they type is set to either `plural` or `ordinal`, the value will be used to obtain the appropriate plural or ordinal category which will be used to select a phrase
   * @remarks When the type is set to `key`, the value will be used as is to select a phrase with a matching key
   * @remarks If the value results in a phrase that is not available, it will default to using a phrase with they key `default`
   * @param value - The value to use to select the phrase, should be a number for the `plural` and `ordinal` types and a string for the `key` type
   * @param type - One of `key`, `plural` or `ordinal`, which sets how the phrase selection will happen
   * @param phrases - An object containing the phrases available for selection
   * @returns The selected phrase depending on the given `value` and `type`, or a phrase with the key `default`
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB')
   *
   * const result = i18n.selectPhrase(1, 'ordinal', {
   *   one: '1st place',
   *   two: '2nd place',
   * few: '3rd place',
   * })
   * // '1st place'
   * ```
   */
  public selectPhrase(value: string, type: 'key', phrases: I18nSelectPhrases): string | never
  public selectPhrase(value: number, type: 'plural' | 'ordinal', phrases: I18nSelectPluralPhrases): string | never
  public selectPhrase(
    value: string | number,
    type: I18nSelectType,
    phrases: I18nSelectPhrases | I18nSelectPluralPhrases,
  ): string | never {
    const availablePhrases: I18nSelectPhrases = phrases as I18nSelectPhrases
    let key

    switch (type) {
      case 'plural':
        key = this.getPluralRule(value as number)
        break
      case 'ordinal':
        key = this.getOrdinalRule(value as number)
        break
      default:
        key = value
        break
    }

    if (typeof availablePhrases[key] === 'string') {
      return availablePhrases[key]
    } else if (typeof availablePhrases.default === 'string') {
      return availablePhrases.default
    }

    throw new Error(`Missing selectable phrase key: ${key}`)
  }

  /**
   * Get the parts of a translation for the given key.
   * Translations can have placeholders in the format of `${expression}`, similar to ES template literals.
   * Placeholders will be replaced with corresponding values from the `ctx` object.
   *
   * @remarks When interpolating React components into the translation this is the preferred method as it will preserve the output of their render method
   * @param key - The key of the translation to be obtained
   * @param ctx - The local context to use when interpolating the translation
   * @returns The parts of the interpolated translation associated with the given key
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB', {
   *   translations: {
   *     foobar: 'The quick brown ${getAnimal()} jumps over the lazy dog',
   *   },
   * })
   * const translation = i18n.tToParts('foobar', { getAnimal: function () { return 'fox' } })
   * // ['The quick brown ', 'fox', ' jumps over the lazy dog']
   * ```
   */
  public tToParts(key: string, ctx?: I18nInterpolationContext): unknown[] {
    const locale = this.locale
    const ast = resolveTranslation(locale, key, this.translations, this.parsedTranslations)

    return interpret(ast, {
      ...this.context,
      ...ctx,
    })
  }

  /**
   * Get a translation for the given key.
   * Translations can have placeholders in the format of `${expression}`, similar to ES template literals.
   * Placeholders will be replaced with corresponding values from the `ctx` object.
   *
   * @remarks All placeholders will be cast into strings regardless of data type
   * @param key - The key of the translation to be obtained
   * @param ctx - The local context to use when interpolating the translation
   * @returns The interpolated translation associated with the given key
   * @public
   *
   * @example
   * ```javascript
   * import I18n from '@bugfixes/i18n'
   *
   * const i18n = new I18n('en-GB', {
   *   translations: {
   *     foobar: 'The quick brown ${getAnimal()} jumps over the lazy dog',
   *   },
   * })
   * const translation = i18n.t('foobar', { getAnimal: function () { return 'fox' } })
   * // 'The quick brown fox jumps over the lazy dog'
   * ```
   */
  public t(key: string, ctx?: I18nInterpolationContext): string {
    return this.tToParts(key, ctx).join('')
  }
}
