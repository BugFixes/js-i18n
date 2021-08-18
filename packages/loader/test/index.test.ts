import readdir from '../src/readdir'
import buildTree from '../src/build-tree'
import buildTranslations from '../src/build-translations'
import loadTranslations from '../src'
import { defaultFileRegex } from '../src/constants'

jest.mock('../src/readdir')
jest.mock('../src/build-tree')
jest.mock('../src/build-translations')

describe('Translations loader', function () {
  const mockReaddir = readdir as jest.Mock
  const mockBuildTree = buildTree as jest.Mock
  const mockBuildTranslations = buildTranslations as jest.Mock
  const mockFileList = [
    'en.json',
    'en-gb.json',
  ]
  const mockTree = {
    en: {
      countries: {
        GB: { // eslint-disable-line @typescript-eslint/naming-convention
          phrases: {},
          variations: {},
        },
      },
      phrases: {},
    },
  }
  const mockTranslations = {
    'en-GB': {
      test: 'Test phrase',
    },
  }

  beforeEach(function () {
    mockReaddir.mockResolvedValue(mockFileList)
    mockBuildTree.mockResolvedValue(mockTree)
    mockBuildTranslations.mockReturnValue(mockTranslations)
  })

  test('correctly loads and processes translation data', async function () {
    const result = await loadTranslations({
      path: '/foo/bar/translations',
    })

    expect(mockReaddir).toHaveBeenCalledWith('/foo/bar/translations', defaultFileRegex)
    expect(mockBuildTree).toHaveBeenCalledWith(mockFileList, defaultFileRegex)
    expect(mockBuildTranslations).toHaveBeenCalledWith(mockTree)
    expect(result).toBe(mockTranslations)
  })

  test('accepts a custom regular expression for matching translation files', async function () {
    const inputRegex = /^(?<lang>[a-z]{2})(?:-(?<country>[a-z]{2}))(?:\.(?<variation>[a-z]{3}))?\.json$/
    const result = await loadTranslations({
      path: '/foo/bar/translations',
      regex: inputRegex,
    })

    expect(mockReaddir).toHaveBeenCalledWith('/foo/bar/translations', inputRegex)
    expect(mockBuildTree).toHaveBeenCalledWith(mockFileList, inputRegex)
    expect(mockBuildTranslations).toHaveBeenCalledWith(mockTree)
    expect(result).toBe(mockTranslations)
  })
})
