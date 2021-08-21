import * as React from 'react'
import ReactDOMServer from 'react-dom/server'
import I18n from '@bugfixes/i18n'
import {
  I18nProvider,
  useI18n,
} from '../src'

describe('useI18n hook', function () {
  const i18n = new I18n('en-GB')

  test('returns the current I18n instance', function () {
    let contextI18n

    function Dummy(): null {
      contextI18n = useI18n()

      return null
    }

    ReactDOMServer.renderToString(<I18nProvider i18n={i18n}><Dummy/></I18nProvider>)

    expect(contextI18n).toBe(i18n)
  })
})
