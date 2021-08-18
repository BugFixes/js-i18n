import {
  date,
  number
} from '@bugfixes/i18n-formats'
import I18n from '../src'

describe('I18n', function () {
  describe('default interpolation context option', function () {
    test('has instance methods as defaults', function () {
      const output = new I18n('en-GB')

      // @ts-expect-error: accessing the context to test the content
      expect(output.context.formatCurrency).toBe(output.formatCurrency)

      // @ts-expect-error: accessing the context to test the content
      expect(output.context.formatDate).toBe(output.formatDate)

      // @ts-expect-error: accessing the context to test the content
      expect(output.context.formatUTCDate).toBe(output.formatUTCDate)

      // @ts-expect-error: accessing the context to test the content
      expect(output.context.formatNumber).toBe(output.formatNumber)

      // @ts-expect-error: accessing the context to test the content
      expect(output.context.formatPercentage).toBe(output.formatPercentage)

      // @ts-expect-error: accessing the context to test the content
      expect(output.context.getOrdinalRule).toBe(output.getOrdinalRule)

      // @ts-expect-error: accessing the context to test the content
      expect(output.context.getPluralRule).toBe(output.getPluralRule)

      // @ts-expect-error: accessing the context to test the content
      expect(output.context.selectPhrase).toBe(output.selectPhrase)

      // @ts-expect-error: accessing the context to test the content
      expect(output.context.t).toBe(output.t)

      // @ts-expect-error: accessing the context to test the content
      expect(output.context.tToParts).toBe(output.tToParts)
    })

    test('extends the default context', function () {
      const output = new I18n('en-GB', {
        defaultContext: {
          foo: 'bar',
        },
      })

      // @ts-expect-error: accessing the context to test the content
      expect(output.context).toEqual({
        foo: 'bar',
        formatCurrency: output.formatCurrency,
        formatDate: output.formatDate,
        formatNumber: output.formatNumber,
        formatPercentage: output.formatPercentage,
        formatUTCDate: output.formatUTCDate,
        getOrdinalRule: output.getOrdinalRule,
        getPluralRule: output.getPluralRule,
        selectPhrase: output.selectPhrase,
        t: output.t,
        tToParts: output.tToParts,
      })
    })
  })

  describe('locale option', function () {
    test('is correctly set', function () {
      const output = new I18n('en-GB')

      expect(output.locale).toBe('en-GB')
    })
  })

  describe('formats option', function () {
    test('has default formats', function () {
      const output = new I18n('en-GB')

      expect(output.formats).toEqual({
        currency: {
          default: number.currency,
        },
        date: {
          default: date.default,
          full: date.full,
          long: date.long,
          medium: date.medium,
          short: date.short,
        },
        number: {
          decimal: number.decimal,
          default: number.default,
          integer: number.integer,
        },
        percentage: {
          default: number.percent,
        },
      })
    })

    test('extends the default formats', function () {
      const output = new I18n('en-GB', {
        formats: {
          currency: {
            test: {
              maximumFractionDigits: 3,
            },
          },
          date: {
            medium: {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            },
            test: {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
            },
          },
          number: {
            test: {
              minimumIntegerDigits: 2,
            },
          },
          percentage: {
            test: {
              maximumFractionDigits: 1,
              minimumIntegerDigits: 1,
            },
          },
        },
      })

      expect(output.formats).toEqual({
        currency: {
          default: number.currency,
          test: {
            maximumFractionDigits: 3,
          },
        },
        date: {
          default: date.default,
          full: date.full,
          long: date.long,
          medium: {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          },
          short: date.short,
          test: {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          },
        },
        number: {
          decimal: number.decimal,
          default: number.default,
          integer: number.integer,
          test: {
            minimumIntegerDigits: 2,
          },
        },
        percentage: {
          default: number.percent,
          test: {
            maximumFractionDigits: 1,
            minimumIntegerDigits: 1,
          },
        },
      })
    })
  })

  describe('translations option', function () {
    test('defaults to an empty translations store', function () {
      const output = new I18n('en-GB')

      expect(output.translations).toEqual({})
    })

    test('sets translations with dot notation keys', function () {
      const output = new I18n('en-GB', {
        translations: {
          foo: {
            bar: 'The quick brown fox jumps over the lazy dog',
          },
          test: 'The slow orange fox rolls under the hyperactive dog',
        },
      })

      expect(output.translations).toEqual({
        'foo.bar': 'The quick brown fox jumps over the lazy dog',
        'test': 'The slow orange fox rolls under the hyperactive dog',
      })
    })

    test('can be extended', function () {
      const output = new I18n('en-GB', {
        translations: {
          foo: {
            bar: 'The quick brown fox jumps over the lazy dog',
          },
          test: 'The slow orange fox rolls under the hyperactive dog',
        },
      })

      output.t('test') // Cause a translation to be cached

      output.extendTranslations({
        extend: {
          test: 'Test addition',
        },
        test: 'Test extension',
      })

      expect(output.translations).toEqual({
        'extend.test': 'Test addition',
        'foo.bar': 'The quick brown fox jumps over the lazy dog',
        'test': 'Test extension',
      })

      // @ts-expect-error: accessing the parsed translations store to test correct behavior
      expect(output.parsedTranslations).toEqual({})
    })
  })
})
