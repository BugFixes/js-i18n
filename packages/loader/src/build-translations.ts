import deepmerge from 'deepmerge'
import type {
  Phrases,
  Translations,
  TranslationsTree,
} from './types'

/**
 * Returns a default empty object if the input value is not a valid phrases object.
 *
 * @param input - A phrases object or any other value
 * @returns The input phrases or an empty object
 */
function phrasesWithDefault(input: any): Phrases {
  if (typeof input === 'object' && input !== null) {
    return input as Phrases
  }

  return {}
}

/**
 * Combine the different translations available to hydrate the data.
 *
 * @param tree - The tree representation of the available translations
 * @returns An object containing translation phrases for the different locales
 */
export default function buildTranslations(tree: TranslationsTree): Translations {
  const output: Translations = {}

  Object.entries(tree).forEach(function ([lang, subtree]) {
    // Handle translations for the base language
    if (Object.keys(subtree.phrases).length !== 0) {
      output[lang] = subtree.phrases
    }

    // Handle translations for variations of the base language
    Object.entries(subtree.variations).forEach(function ([variation, variationSubtree]) {
      if (Object.keys(variationSubtree.phrases).length !== 0) {
        const variationPhrases = deepmerge(
          phrasesWithDefault(subtree.phrases),
          variationSubtree.phrases,
        )

        output[`${lang}.${variation}`] = variationPhrases
      }
    })

    // Handle translations for different countries
    Object.entries(subtree.countries).forEach(function ([country, countrySubtree]) {
      if (Object.keys(countrySubtree.phrases).length !== 0) {
        const countryPhrases = deepmerge(
          phrasesWithDefault(subtree.phrases),
          countrySubtree.phrases,
        )

        output[`${lang}-${country}`] = countryPhrases
      }

      // Handle translations for variations of the country specific translations
      Object.entries(countrySubtree.variations).forEach(function ([variation, variationSubtree]) {
        if (Object.keys(variationSubtree.phrases).length === 0) {
          return
        }

        const variationPhrases = deepmerge.all([
          phrasesWithDefault(subtree.phrases),
          phrasesWithDefault((subtree.variations[variation] as { phrases: Phrases } | undefined)?.phrases),
          phrasesWithDefault(countrySubtree.phrases),
          variationSubtree.phrases,
        ]) as Phrases

        output[`${lang}-${country}.${variation}`] = variationPhrases
      })
    })
  })

  return output
}
