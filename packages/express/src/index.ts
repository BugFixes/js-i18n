import accepts from 'accepts'
import I18n from '@bugfixes/i18n'
import loadTranslations from '@bugfixes/i18n-loader'
import type express from 'express'
import type {
  I18nFormatOptions,
  I18nInterpolationContext,
} from '@bugfixes/i18n'
import type {
  Translations,
} from '@bugfixes/i18n-loader'

// Extend the Express types to include the `i18n` property in the request object
declare module 'express' {
  interface Request { // eslint-disable-line @typescript-eslint/consistent-type-definitions
    i18n: I18n,
  }
}

export type Options = {
  defaultContext?: I18nInterpolationContext,
  defaultLocale: string,
  fileRegEx?: RegExp,
  formats?: I18nFormatOptions,
  preferredVariation?: string,
  translationsPath: string,
  getDefaultLocale?(req: express.Request, availableLocales: string[], preferredLocales: string[]): string | undefined,
  getPreferredVariation?(req: express.Request): string | undefined,
}

class I18nMiddleware {
  public availableLocales: string[] = []

  public ready: boolean = false

  private cache: {[locale: string]: I18n } = {}

  private options: Options

  private translations: Translations = {}

  constructor(options: Options) {
    this.options = options

    this.init = this.init.bind(this)
    this.getI18n = this.getI18n.bind(this)
  }

  /**
   * Gets the preferred locale for the current request.
   *
   * @param req - The Express request object
   * @returns A valid default locale to be used
   */
  public getPreferredLocale(req: express.Request): string {
    const { defaultLocale, getDefaultLocale } = this.options
    const availableLocales = this.availableLocales
    const userPreferredLocale = req.acceptsLanguages(availableLocales)

    if (typeof userPreferredLocale === 'string') {
      return userPreferredLocale
    }

    // Use the user provided function if available
    if (typeof getDefaultLocale === 'function') {
      const userPreferredLocales = accepts(req).languages()
      const customDefaultLocale = getDefaultLocale(req, availableLocales, userPreferredLocales)

      if (typeof customDefaultLocale === 'string') {
        // Require the given locale to be loaded
        if (!this.availableLocales.includes(customDefaultLocale)) {
          throw new Error(`The list of available locales does not included the provided default: ${customDefaultLocale}`)
        }

        return customDefaultLocale
      }
    }

    return defaultLocale
  }

  /**
   * Get an I18n instance for the current request.
   *
   * @param req - The Express request object
   * @returns A fully configured and ready to use I18n instance
   */
  public getI18n(req: express.Request): I18n {
    const { defaultContext, formats, getPreferredVariation, preferredVariation } = this.options
    const computedPreferredLocale = this.getPreferredLocale(req)
    const computedPreferredVariation = typeof getPreferredVariation === 'function' ? getPreferredVariation(req) : preferredVariation
    const translations = this.translations
    const cache = this.cache
    let key = computedPreferredLocale

    // Check if the preferred locale is available in the preferred variation
    if (typeof computedPreferredVariation === 'string' && translations.hasOwnProperty(`${computedPreferredLocale}.${computedPreferredVariation}`)) {
      key += `.${computedPreferredVariation}`

      // Check if the preferred locale is available without a variation
    } else if (!translations.hasOwnProperty(key)) {
      throw new Error(`The selected locale is not available: ${key}`)
    }

    // Use a cached I18n instance if available
    if (cache.hasOwnProperty(key)) {
      return cache[key]
    }

    const i18n = new I18n(computedPreferredLocale, {
      defaultContext: defaultContext,
      formats: formats,
      translations: translations[key],
    })

    // Cache the I18n instance
    cache[key] = i18n

    return i18n
  }

  /**
   * Initializes the i18n Express middleware by loading all available translations.
   */
  public async init(): Promise<void> {
    const { defaultLocale, fileRegEx, translationsPath } = this.options
    const translations = await loadTranslations({
      path: translationsPath,
      regex: fileRegEx,
    })

    // Get list of available locales
    const availableLocales = Object.keys(translations).filter(function (locale) {
      return typeof locale.split('.')[1] === 'undefined' // Discard variations from the available locales
    })

    // Require the default locale to be loaded
    if (!availableLocales.includes(defaultLocale)) {
      throw new Error(`The list of available locales does not included the default: ${defaultLocale}`)
    }

    this.translations = translations
    this.availableLocales = availableLocales

    this.ready = true
  }
}

/**
 * Creates an Express middleware function that will detect the user's preferred language and provide a fully configured I18n instance to localize the response.
 * The I18n instance will be available as the `i18n` property of the request object in the next middlewares and request handlers.
 *
 * If there are no translations available for the user's preferred locale, the configured default locale will be used instead.
 *
 * @param options - The options to change how the middleware behaves
 * @returns An Express middleware function
 *
 * @example
 * ```javascript
 * import express from 'express'
 * import createI18nMiddleware from '@bugfixes/i18n-express'
 *
 * const app = express()
 * const i18nMiddleware = createI18nMiddleware({
 *   defaultLocale: 'en-GB',
 *   translationsPath: '/foo/bar/translations',
 * })
 *
 * app.use(i18nMiddleware)
 *
 * i18nMiddleware.init().then(function () {
 *   app.listen(8080)
 * })
 * ```
 */
export default function createI18nMiddleware(options: Options): express.RequestHandler & { init(): Promise<void> } {
  const instance = new I18nMiddleware(options)

  /**
   * Detects the user's preferred locale and provides an I18n instance for it.
   *
   * @param req - The Express request object
   */
  function i18nMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!instance.ready) {
      throw new Error('The i18n middleware has not been initialized')
    }

    req.i18n = instance.getI18n(req)

    next()
  }

  i18nMiddleware.init = instance.init

  return i18nMiddleware
}
