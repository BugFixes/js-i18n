import accepts from 'accepts'
import {
  deepFreeze,
} from '@bugfixes/object-utils'
import loader from '@bugfixes/i18n-loader'
import createI18nMiddleware from '../src'
import type express from 'express'

type RequestHandlerArgs = {
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
}

jest.mock('accepts')
jest.mock('@bugfixes/i18n-loader')

describe('i18n Express middleware', function () {
  const mockAccepts = accepts as jest.Mock
  const mockLanguages = jest.fn() // Mock for Accepts' `languages()` meant to return an array of locale strings
  const mockLoader = loader as jest.Mock
  const mockAcceptsLanguages = jest.fn() // Mock for Express's `req.acceptsLanguages()` meant to return a single locale string or `false`
  const mockNextFunction = jest.fn()
  const mockTranslations = deepFreeze({
    'en': {
      test: 'en translations',
    },
    'en-GB': {
      test: 'en-GB translations',
    },
    'pt-PT': {
      test: 'pt-PT translations',
    },
  })
  const mockFormats = deepFreeze({
    currency: {
      test: {
        currency: 'USD', // Show `$` as symbol when the currency is unknown
        currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        style: 'currency',
      },
    },
  })
  const mockPreferredLocales = deepFreeze(['fr-CH', 'fr', 'en', 'de'])

  function getMockRequestHandlerArgs(headers = {}): RequestHandlerArgs {
    return {
      next: mockNextFunction,
      req: ({
        acceptsLanguages: mockAcceptsLanguages,
        headers: {
          ...headers,
        },
      } as unknown) as express.Request,
      res: ({} as unknown) as express.Response,
    }
  }

  beforeEach(function () {
    mockLanguages.mockReturnValue(mockPreferredLocales)
    mockAccepts.mockReturnValue({
      languages: mockLanguages,
    })
    mockLoader.mockResolvedValue(mockTranslations)
  })

  test('throws if used without initializing', function () {
    const { req, res, next } = getMockRequestHandlerArgs()
    const middleware = createI18nMiddleware({
      defaultLocale: 'en-GB',
      translationsPath: 'test',
    })

    expect(function () {
      middleware(req, res, next)
    }).toThrow('The i18n middleware has not been initialized')
  })

  test('loads translations when initialized', async function () {
    const mockFilePath = '/foo/bar/translations'
    const mockFileRegEx = /[a-z]+/
    const middleware = createI18nMiddleware({
      defaultLocale: 'en-GB',
      fileRegEx: mockFileRegEx,
      translationsPath: mockFilePath,
    })

    await middleware.init()

    expect(mockLoader).toHaveBeenCalledWith({
      path: mockFilePath,
      regex: mockFileRegEx,
    })
  })

  test('throws an error if the default locale is not available', async function () {
    const middleware = createI18nMiddleware({
      defaultLocale: 'es-ES',
      translationsPath: 'test',
    })

    await expect(middleware.init).rejects.toThrow('The list of available locales does not included the default: es-ES')
  })

  test('attaches an I18n instance for the preferred locale of the user to the request object', async function () {
    const { req, res, next } = getMockRequestHandlerArgs()
    const middleware = createI18nMiddleware({
      defaultLocale: 'en-GB',
      formats: mockFormats,
      translationsPath: 'test',
    })

    await middleware.init()

    mockAcceptsLanguages.mockReturnValue('pt-PT')

    middleware(req, res, next)

    const i18n = req.i18n

    expect(i18n.locale).toBe('pt-PT')
    expect(i18n.translations).toEqual(mockTranslations['pt-PT'])
    expect(i18n.formats.currency.test).toEqual(mockFormats.currency.test)
  })

  test('attaches an I18n instance for the default locale to the request object if the preferred locale of the user is not available', async function () {
    const { req, res, next } = getMockRequestHandlerArgs()
    const middleware = createI18nMiddleware({
      defaultLocale: 'en-GB',
      formats: mockFormats,
      translationsPath: 'test',
    })

    await middleware.init()

    mockAcceptsLanguages.mockReturnValue(false)

    middleware(req, res, next)

    const i18n = req.i18n

    expect(i18n.locale).toBe('en-GB')
    expect(i18n.translations).toEqual(mockTranslations['en-GB'])
    expect(i18n.formats.currency.test).toEqual(mockFormats.currency.test)
  })

  test('attaches an I18n instance for a custom default locale to the request object if the preferred locale of the user is not available', async function () {
    const { req, res, next } = getMockRequestHandlerArgs()
    const mockGetDefaultLocale = jest.fn()
    const middleware = createI18nMiddleware({
      defaultLocale: 'en-GB',
      formats: mockFormats,
      getDefaultLocale: mockGetDefaultLocale,
      translationsPath: 'test',
    })

    await middleware.init()

    mockGetDefaultLocale.mockReturnValue('pt-PT')
    mockAcceptsLanguages.mockReturnValue(false)

    middleware(req, res, next)

    const i18n = req.i18n

    expect(mockGetDefaultLocale).toHaveBeenCalledWith(req, ['en', 'en-GB', 'pt-PT'], mockPreferredLocales)
    expect(mockAccepts).toHaveBeenCalledWith(req)
    expect(i18n.locale).toBe('pt-PT')
    expect(i18n.translations).toEqual(mockTranslations['pt-PT'])
    expect(i18n.formats.currency.test).toEqual(mockFormats.currency.test)
  })

  test('throws if the custom default locale is not one of the available locales', async function () {
    const { req, res, next } = getMockRequestHandlerArgs()
    const middleware = createI18nMiddleware({
      defaultLocale: 'en-GB',
      getDefaultLocale: jest.fn(function (reqArg: express.Request, availableLocales: string[], preferredLocales: string[]): string {
        expect(reqArg).toBe(req)
        expect(availableLocales).toEqual(['en', 'en-GB', 'pt-PT'])
        expect(preferredLocales).toBe(mockPreferredLocales)

        return 'fr-CH'
      }),
      translationsPath: 'test',
    })

    await middleware.init()

    mockAcceptsLanguages.mockReturnValue(false)

    expect(function () {
      middleware(req, res, next)
    }).toThrow('The list of available locales does not included the provided default: fr-CH')
  })

  test('attaches an I18n instance for a default locale to the request object if a custom default locale is not returned', async function () {
    const { req, res, next } = getMockRequestHandlerArgs()
    const middleware = createI18nMiddleware({
      defaultLocale: 'en-GB',
      formats: mockFormats,
      getDefaultLocale: jest.fn(function (): undefined {
        return undefined
      }),
      translationsPath: 'test',
    })

    await middleware.init()

    mockAcceptsLanguages.mockReturnValue(false)

    middleware(req, res, next)

    const i18n = req.i18n

    expect(i18n.locale).toBe('en-GB')
    expect(i18n.translations).toEqual(mockTranslations['en-GB'])
    expect(i18n.formats.currency.test).toEqual(mockFormats.currency.test)
  })

  test('caches I18n instances', async function () {
    const { req: reqA, res: resA, next: nextA } = getMockRequestHandlerArgs()
    const { req: reqB, res: resB, next: nextB } = getMockRequestHandlerArgs()
    const middleware = createI18nMiddleware({
      defaultLocale: 'en-GB',
      translationsPath: 'test',
    })

    await middleware.init()

    mockAcceptsLanguages.mockReturnValue('en-GB')

    middleware(reqA, resA, nextA)
    middleware(reqB, resB, nextB)

    expect(reqB.i18n).toBe(reqA.i18n)
  })

  test('calls the next function', async function () {
    const { req, res, next } = getMockRequestHandlerArgs()
    const middleware = createI18nMiddleware({
      defaultLocale: 'en-GB',
      translationsPath: 'test',
    })

    await middleware.init()

    mockAcceptsLanguages.mockReturnValue('en-GB')

    middleware(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })
})
