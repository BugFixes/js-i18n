import fs from 'fs/promises'
import buildTree from '../src/build-tree'

jest.mock('fs/promises')

describe('Tree builder', function () {
  const mockReadFile = fs.readFile as jest.Mock
  const mockTranslations = {
    '/foo/bar/translations/en.json': {
      brandName: 'Bugfixes',
      completeAction: 'Finalize',
      continue: 'Continue',
      other: {
        bar: 'Bar',
        foo: 'Foo',
      },
    },
    '/foo/bar/translations/en-gb.json': {
      completeAction: 'Finalise',
      other: {
        gbSpecial: 'en-GB exclusive',
      },
    },
    '/foo/bar/translations/pt-pt.json': {
      brandName: 'Bugfixes',
      completeAction: 'Finalizar',
      continue: 'Continuar',
      other: {
        bar: 'Bar',
        foo: 'Foo',
      },
    },
  }

  beforeEach(function () {
    mockReadFile.mockImplementation(async function (file: string) {
      return Promise.resolve(JSON.stringify(
        mockTranslations[file as keyof typeof mockTranslations],
      ))
    })
  })

  test('correctly builds a translations tree for the given file list', async function () {
    const inputFiles = [
      '/foo/bar/translations/en.json',
      '/foo/bar/translations/en-gb.json',
      '/foo/bar/translations/pt-pt.json',
    ]
    const inputRegex = /^(?<lang>[a-z]{2})(?:-(?<country>[a-z]{2}))?(?:\.(?<variation>[a-z]+))?\.json$/i
    const result = await buildTree(inputFiles, inputRegex)

    expect(result).toEqual({
      en: {
        countries: {
          GB: { // eslint-disable-line @typescript-eslint/naming-convention
            phrases: mockTranslations['/foo/bar/translations/en-gb.json'],
            variations: {},
          },
        },
        phrases: mockTranslations['/foo/bar/translations/en.json'],
        variations: {},
      },
      pt: {
        countries: {
          PT: { // eslint-disable-line @typescript-eslint/naming-convention
            phrases: mockTranslations['/foo/bar/translations/pt-pt.json'],
            variations: {},
          },
        },
        phrases: {},
        variations: {},
      },
    })
  })
})
