import I18n from '../src'
import parse from '../src/utils/parser'
import interpret from '../src/utils/interpreter'

jest.mock('../src/utils/parser')
jest.mock('../src/utils/interpreter')

describe('I18n', function () {
  const mockParse = parse as jest.Mock
  const mockInterpret = interpret as jest.Mock

  beforeEach(function () {
    const actualParse = jest.requireActual('../src/utils/parser').default
    const actualInterpret = jest.requireActual('../src/utils/interpreter').default

    mockParse.mockImplementation(actualParse)
    mockInterpret.mockImplementation(actualInterpret)
  })

  describe('hasTranslation()', function () {
    test('returns `true` if a translation exists', function () {
      const i18n = new I18n('en-GB', {
        translations: {
          foo: 'bar',
        },
      })

      expect(i18n.hasTranslation('foo')).toBe(true)
    })

    test('returns `false` if a translation does not exist', function () {
      const i18n = new I18n('en-GB')

      expect(i18n.hasTranslation('foo')).toBe(false)
    })
  })

  describe('tToParts()', function () {
    test('provides the translation for a given key', function () {
      const i18n = new I18n('en-GB', {
        translations: {
          foo: 'bar',
        },
      })

      expect(i18n.t('foo')).toBe('bar')
    })

    test('throws an error if a translation is missing', function () {
      const i18n = new I18n('en-GB', {
        translations: {
          alt: 'foobar',
        },
      })

      expect(function () {
        i18n.tToParts('foo')
      }).toThrow('The locale \'en-GB\' is missing the translation with the key \'foo\'')
    })

    test('lazily parses translation ASTs and caches the results', function () {
      const i18n = new I18n('en-GB', {
        translations: {
          foo: 'bar',
        },
      })

      expect(mockParse).toHaveBeenCalledTimes(0)
      expect(mockInterpret).toHaveBeenCalledTimes(0)
      expect(i18n.tToParts('foo')).toEqual(['bar'])
      expect(mockParse).toHaveBeenCalledTimes(1)
      expect(mockInterpret).toHaveBeenCalledTimes(1)
      expect(i18n.tToParts('foo')).toEqual(['bar'])
      expect(mockParse).toHaveBeenCalledTimes(1)
      expect(mockInterpret).toHaveBeenCalledTimes(2)
    })

    test('interpolates using the default instance context and the context provided', function () {
      const ctx = {
        getFoobar() {
          return 'foobar'
        },
      }
      const i18n = new I18n('en-GB', {
        translations: {
          foo: 'bar',
        },
      })

      i18n.tToParts('foo', ctx)

      expect(mockInterpret).toHaveBeenCalledWith(mockParse.mock.results[0].value, {
        // @ts-expect-error: accessing the context to test the content
        ...i18n.context,
        ...ctx,
      })
    })

    test('interpolates placeholders with provided string values', function () {
      const i18n = new I18n('en-GB', {
        translations: {
          foobar: 'The quick ${animalColor} ${animalSpecies} jumps over the lazy dog', // eslint-disable-line no-template-curly-in-string
        },
      })

      expect(i18n.tToParts('foobar', {
        animalColor: 'brown',
        animalSpecies: 'fox',
      })).toEqual([
        'The quick ', 'brown', ' ', 'fox', ' jumps over the lazy dog',
      ])
    })

    test('interpolates placeholders with provided number values', function () {
      const i18n = new I18n('en-GB', {
        translations: {
          foobar: 'Days without a workplace accident: ${daysCount}', // eslint-disable-line no-template-curly-in-string
        },
      })

      expect(i18n.tToParts('foobar', {
        daysCount: 21,
      })).toEqual(['Days without a workplace accident: ', 21])
    })

    test('interpolates placeholders with provided boolean values', function () {
      const i18n = new I18n('en-GB', {
        translations: {
          foobar: 'Booleans are supported: ${booleansSupported}', // eslint-disable-line no-template-curly-in-string
        },
      })

      expect(i18n.tToParts('foobar', {
        booleansSupported: true,
      })).toEqual(['Booleans are supported: ', true])
    })
  })

  describe('t', function () {
    test('joins the output of `tToParts`', function () {
      const i18n = new I18n('en-GB', {
        translations: {
          foo: 'The quick ${foxColor} fox jumps over the lazy dog', // eslint-disable-line no-template-curly-in-string
        },
      })

      jest.spyOn(i18n, 'tToParts').mockReturnValue([
        'The quick brown ', 'fox', ' jumps over the lazy dog',
      ])

      expect(i18n.t('foo', { foxColor: 'brown' })).toBe('The quick brown fox jumps over the lazy dog')
      expect(i18n.tToParts).toHaveBeenCalledWith('foo', { foxColor: 'brown' })
    })
  })
})
