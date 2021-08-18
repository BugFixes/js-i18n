import {
  getPluralRule,
} from '../src'

describe('getPluralRule()', function () {
  describe('given Intl.PluralRules is supported', function () {
    const mockSelect = jest.fn()

    beforeEach(function () {
      mockSelect.mockReturnValue('test')
      jest.spyOn(Intl, 'PluralRules').mockReturnValue({
        resolvedOptions: jest.fn(),
        select: mockSelect,
      })
    })

    test('correctly gets the plural rule defaulting to a cardinal type', function () {
      const output = getPluralRule('en-GB', 2)

      expect(output).toBe('test')
      expect(Intl.PluralRules).toHaveBeenCalledWith('en-GB', {
        type: 'cardinal',
      })
      expect(mockSelect).toHaveBeenCalledWith(2)
    })

    test('correctly gets the plural rule of a cardinal type', function () {
      const output = getPluralRule('en-GB', 5, false)

      expect(output).toBe('test')
      expect(Intl.PluralRules).toHaveBeenCalledWith('en-GB', {
        type: 'cardinal',
      })
      expect(mockSelect).toHaveBeenCalledWith(5)
    })

    test('correctly gets the plural rule of an ordinal type', function () {
      const output = getPluralRule('en-GB', 3, true)

      expect(output).toBe('test')
      expect(Intl.PluralRules).toHaveBeenCalledWith('en-GB', {
        type: 'ordinal',
      })
      expect(mockSelect).toHaveBeenCalledWith(3)
    })
  })

  describe('given Intl.PluralRules is not supported', function () {
    const originalPluralRules = Intl.PluralRules

    beforeEach(function () {
      // @ts-expect-error Overriding Intl.PluralRules for testing purposes
      Intl.PluralRules = undefined
    })

    afterEach(function () {
      // @ts-expect-error Restoring Intl.PluralRules for testing purposes
      Intl.PluralRules = originalPluralRules
    })

    describe.each([
      'en',
      'en-GB',
      'en-US',
    ])('with the locale being `%s`', function (locale: string): void {
      describe('using a cardinal type', function () {
        test('returns `one` for the number 1', function () {
          const output = getPluralRule(locale, 1)

          expect(output).toBe('one')
        })

        test('returns `other` for any other numbers', function () {
          expect(getPluralRule(locale, 0)).toBe('other')
          expect(getPluralRule(locale, 2)).toBe('other')
          expect(getPluralRule(locale, 3)).toBe('other')
          expect(getPluralRule(locale, 4)).toBe('other')
          expect(getPluralRule(locale, 10)).toBe('other')
          expect(getPluralRule(locale, 11)).toBe('other')
          expect(getPluralRule(locale, 12)).toBe('other')
          expect(getPluralRule(locale, 13)).toBe('other')
          expect(getPluralRule(locale, 14)).toBe('other')
          expect(getPluralRule(locale, 20)).toBe('other')
          expect(getPluralRule(locale, 21)).toBe('other')
          expect(getPluralRule(locale, 22)).toBe('other')
          expect(getPluralRule(locale, 23)).toBe('other')
          expect(getPluralRule(locale, 24)).toBe('other')
        })
      })

      describe('using an ordinal type', function () {
        test('returns `one` for numbers ending in 1 except numbers ending in 11', function () {
          expect(getPluralRule(locale, 1, true)).toBe('one')
          expect(getPluralRule(locale, 11, true)).not.toBe('one')
          expect(getPluralRule(locale, 21, true)).toBe('one')
          expect(getPluralRule(locale, 31, true)).toBe('one')
          expect(getPluralRule(locale, 41, true)).toBe('one')
          expect(getPluralRule(locale, 101, true)).toBe('one')
          expect(getPluralRule(locale, 111, true)).not.toBe('one')
          expect(getPluralRule(locale, 121, true)).toBe('one')
          expect(getPluralRule(locale, 131, true)).toBe('one')
          expect(getPluralRule(locale, 141, true)).toBe('one')
        })

        test('returns `two` for numbers ending in 2 except numbers ending in 12', function () {
          expect(getPluralRule(locale, 2, true)).toBe('two')
          expect(getPluralRule(locale, 12, true)).not.toBe('two')
          expect(getPluralRule(locale, 22, true)).toBe('two')
          expect(getPluralRule(locale, 32, true)).toBe('two')
          expect(getPluralRule(locale, 42, true)).toBe('two')
          expect(getPluralRule(locale, 102, true)).toBe('two')
          expect(getPluralRule(locale, 112, true)).not.toBe('two')
          expect(getPluralRule(locale, 122, true)).toBe('two')
          expect(getPluralRule(locale, 132, true)).toBe('two')
          expect(getPluralRule(locale, 142, true)).toBe('two')
        })

        test('returns `few` for numbers ending in 3 except numbers ending in 13', function () {
          expect(getPluralRule(locale, 3, true)).toBe('few')
          expect(getPluralRule(locale, 13, true)).not.toBe('few')
          expect(getPluralRule(locale, 23, true)).toBe('few')
          expect(getPluralRule(locale, 33, true)).toBe('few')
          expect(getPluralRule(locale, 43, true)).toBe('few')
          expect(getPluralRule(locale, 103, true)).toBe('few')
          expect(getPluralRule(locale, 113, true)).not.toBe('few')
          expect(getPluralRule(locale, 123, true)).toBe('few')
          expect(getPluralRule(locale, 133, true)).toBe('few')
          expect(getPluralRule(locale, 143, true)).toBe('few')
        })

        test('returns `other` any other numbers', function () {
          expect(getPluralRule(locale, 0, true)).toBe('other')
          expect(getPluralRule(locale, 4, true)).toBe('other')
          expect(getPluralRule(locale, 5, true)).toBe('other')
          expect(getPluralRule(locale, 6, true)).toBe('other')
          expect(getPluralRule(locale, 7, true)).toBe('other')
          expect(getPluralRule(locale, 8, true)).toBe('other')
          expect(getPluralRule(locale, 9, true)).toBe('other')
          expect(getPluralRule(locale, 10, true)).toBe('other')
          expect(getPluralRule(locale, 12, true)).toBe('other')
          expect(getPluralRule(locale, 12, true)).toBe('other')
          expect(getPluralRule(locale, 13, true)).toBe('other')
          expect(getPluralRule(locale, 20, true)).toBe('other')
          expect(getPluralRule(locale, 24, true)).toBe('other')
          expect(getPluralRule(locale, 25, true)).toBe('other')
          expect(getPluralRule(locale, 26, true)).toBe('other')
          expect(getPluralRule(locale, 27, true)).toBe('other')
          expect(getPluralRule(locale, 28, true)).toBe('other')
          expect(getPluralRule(locale, 29, true)).toBe('other')
          expect(getPluralRule(locale, 100, true)).toBe('other')
          expect(getPluralRule(locale, 104, true)).toBe('other')
          expect(getPluralRule(locale, 105, true)).toBe('other')
          expect(getPluralRule(locale, 106, true)).toBe('other')
          expect(getPluralRule(locale, 107, true)).toBe('other')
          expect(getPluralRule(locale, 108, true)).toBe('other')
          expect(getPluralRule(locale, 109, true)).toBe('other')
        })
      })
    })

    describe('with the locale being unsupported', function () {
      test('throws an error', function () {
        expect(function () {
          getPluralRule('foo-BAR', 2)
        }).toThrow('Unsupported locale: foo-BAR')
      })
    })
  })
})
