import fs from 'fs/promises'
import path from 'path'

/**
 * Get a list of all the files containing translations.
 *
 * @param translationsDir - The path of the directory where translation files are kept
 * @param regex - A regular expression that all translation files must match
 * @returns A list of files containing translations
 */
export default async function readdir(translationsDir: string, regex: RegExp): Promise<string[]> {
  const files = await fs.readdir(translationsDir)

  return files.filter(function (filename) {
    return regex.test(filename) && path.extname(filename) === '.json' // Ignore files that don't match the required format
  }).map(function (filename) {
    return path.join(translationsDir, filename)
  })
}
