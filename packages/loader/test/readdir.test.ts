import fs from 'fs/promises'
import path from 'path'
import readdir from '../src/readdir'

jest.mock('fs/promises')

describe('Directory reader', function () {
  const mockReaddir = fs.readdir as jest.Mock

  beforeEach(function () {
    mockReaddir.mockResolvedValue([
      '.env',
      '.gitignore',
      'en.json',
      'en.tsb.json',
      'en.anz.json',
      'en-gb.json',
      'en-gb.txt',
      'eng-gb.json',
      'en-gbr.json',
      'en-gb.tsb.json',
      'en-gb.anz.json',
      'tsconfig.json',
    ])
  })

  test('returns a list of files in the given directory that match the given regular expression', async function () {
    const inputPath = '/foo/bar/translations'
    const inputRegex = /^(?<lang>[a-z]{2})(?:-(?<country>[a-z]{2}))?(?:\.(?<variation>[a-z]+))?\.json$/i
    const result = await readdir(inputPath, inputRegex)

    expect(mockReaddir).toHaveBeenCalledWith(inputPath)
    expect(result).toEqual([
      path.join(inputPath, 'en.json'),
      path.join(inputPath, 'en.tsb.json'),
      path.join(inputPath, 'en.anz.json'),
      path.join(inputPath, 'en-gb.json'),
      path.join(inputPath, 'en-gb.tsb.json'),
      path.join(inputPath, 'en-gb.anz.json'),
    ])
  })
})
