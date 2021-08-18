import buildTranslations from '../src/build-translations'
import type {
  TranslationsTree,
} from '../src/types'

jest.mock('fs/promises')

describe('Translations builder', function () {
  test('correctly builds the translations from a translations tree', function () {
    const inputTree: TranslationsTree = {
      en: {
        countries: {
          GB: { // eslint-disable-line @typescript-eslint/naming-convention
            phrases: {
              completeAction: 'Finalise',
              other: {
                gbSpecial: 'en-GB exclusive',
              },
            },
            variations: {},
          },
        },
        phrases: {
          brandName: 'Bugfixes',
          completeAction: 'Finalize',
          continue: 'Continue',
          other: {
            bar: 'Bar',
            foo: 'Foo',
          },
        },
        variations: {},
      },
      pt: {
        countries: {
          BR: { // eslint-disable-line @typescript-eslint/naming-convention
            phrases: {},
            variations: {},
          },
          PT: { // eslint-disable-line @typescript-eslint/naming-convention
            phrases: {
              brandName: 'Bugfixes',
              completeAction: 'Finalizar',
              continue: 'Continuar',
              other: {
                bar: 'Bar',
                foo: 'Foo',
              },
            },
            variations: {
              random: {
                phrases: {
                  test: 'test',
                },
              },
              tsb: {
                phrases: {},
              },
            },
          },
        },
        phrases: {},
        variations: {
          anz: {
            phrases: {},
          },
          tsb: {
            phrases: {},
          },
        },
      },
    }
    const result = buildTranslations(inputTree)

    expect(result).toEqual({
      'en': {
        brandName: 'Bugfixes',
        completeAction: 'Finalize',
        continue: 'Continue',
        other: {
          bar: 'Bar',
          foo: 'Foo',
        },
      },
      'en-GB': {
        brandName: 'Bugfixes',
        completeAction: 'Finalise',
        continue: 'Continue',
        other: {
          bar: 'Bar',
          foo: 'Foo',
          gbSpecial: 'en-GB exclusive',
        },
      },
      'pt-PT': {
        brandName: 'Bugfixes',
        completeAction: 'Finalizar',
        continue: 'Continuar',
        other: {
          bar: 'Bar',
          foo: 'Foo',
        },
      },
      'pt-PT.random': {
        brandName: 'Bugfixes',
        completeAction: 'Finalizar',
        continue: 'Continuar',
        other: {
          bar: 'Bar',
          foo: 'Foo',
        },
        test: 'test',
      },
    })
  })
})
