import readdir from './readdir'
import buildTree from './build-tree'
import buildTranslations from './build-translations'
import {
  defaultFileRegex,
} from './constants'
import type {
  Translations,
} from './types'

export type {
  Phrases,
  Translations,
} from './types'

export type Options = {
  path: string,
  regex?: RegExp,
}

/**
 * Load and process the available translation data from the files contained in the given directory.
 *
 * By default, translation files should follow a naming convention of `<language>-<country>.<variation>.json` such as `en-gb.tsb`.
 * The `language` and `country` parts should be 2 character ISO 639-1 and ISO 3166-1 codes respectively.
 * The `variation` part should be an alpha value of any length. Both the `country` and `variation` values are optional.
 * This is possible to change via the regex option.
 *
 * *All translation files must be contained in the same directory with no sub-directories.*
 *
 * @param translationsDir - The path of the directory where translation files are kept
 * @returns The available translation data
 *
 * @example
 * ```javascript
 * import loadTranslations from '@bugfixes/i18n-loader'
 *
 * async function example() {
 *   const translations = await loadTranslations({
 *     path: '/translations',
 *     regex: /^(?<lang>[a-z]{2})(?:-(?<country>[a-z]{2}))?(?:\.(?<variation>[a-z]+))?\.json$/i,
 *   })
 *
 *   // Do something
 * }
 * ```
 */
export default async function load(options: Options): Promise<Translations> {
  const { path: translationsDir, regex = defaultFileRegex } = options
  const files = await readdir(translationsDir, regex)
  const tree = await buildTree(files, regex)

  return buildTranslations(tree)
}
