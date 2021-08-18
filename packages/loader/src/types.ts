export type Phrases = {
  [key: string]: string | Phrases,
}

export type Translations = {
  [locale: string]: Phrases,
}

export type TranslationsTree = {
  [lang: string]: {
    countries: {
      [country: string]: {
        phrases: Phrases,
        variations: {
          [variation: string]: {
            phrases: Phrases,
          },
        },
      },
    },
    phrases: Phrases,
    variations: {
      [variation: string]: {
        phrases: Phrases,
      },
    },
  },
}
