import fs from 'fs/promises'
import path from 'path'
import type {
  TranslationsTree,
} from './types'

/**
 * Build a tree with the structure of translations for different languages, countries and variations.
 *
 * @param fileList - The list of files containing translations
 * @param regex - A regular expression that all translation files must match
 * @returns A tree representation of the available translations
 */
export default async function buildTree(fileList: string[], regex: RegExp): Promise<TranslationsTree> {
  return fileList.reduce(async function (treeAcc: Promise<TranslationsTree>, filepath) {
    const tree = await treeAcc
    const filename = path.basename(filepath)
    const match = (regex.exec(filename) as RegExpExecArray).groups as {[key: string]: string } // All files already matched the regular expression in the previous step
    const phrases = JSON.parse(await fs.readFile(filepath, 'utf8'))
    const { country, lang, variation } = match
    const formattedLang = lang.toLowerCase()

    const translationsSubtree = typeof tree[formattedLang] !== 'undefined' ? tree[formattedLang] : {
      countries: {},
      phrases: {},
      variations: {},
    }
    tree[formattedLang] = translationsSubtree

    if (typeof country === 'string') {
      const formattedCountry = country.toUpperCase()
      const countryTranslationsSubtree = typeof translationsSubtree.countries[formattedCountry] !== 'undefined' ? translationsSubtree.countries[formattedCountry] : {
        phrases: {},
        variations: {},
      }
      translationsSubtree.countries[formattedCountry] = countryTranslationsSubtree

      if (typeof variation === 'string') {
        const formattedVariation = variation.toLowerCase()

        countryTranslationsSubtree.variations[formattedVariation] = {
          phrases,
        }
      } else {
        countryTranslationsSubtree.phrases = phrases
      }
    } else if (typeof variation === 'string') {
      const formattedVariation = variation.toLowerCase()

      translationsSubtree.variations[formattedVariation] = {
        phrases,
      }
    } else {
      translationsSubtree.phrases = phrases
    }

    return tree
  }, Promise.resolve({}))
}
