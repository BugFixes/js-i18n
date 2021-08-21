import * as React from 'react'
import ReactDOMServer from 'react-dom/server'
import I18n from '@bugfixes/i18n'
import {
  I18nProvider,
  withI18n,
} from '../src'
import type {
  I18nProps,
} from '../src'

describe('withI18n HOC', function () {
  const i18n = new I18n('en-GB')

  test('provides the current I18n instance', function () {
    let contextI18n

    function Dummy(props: I18nProps): null {
      const { i18n: propI18n } = props

      contextI18n = propI18n

      return null
    }

    const WrappedDummy = withI18n(Dummy) // eslint-disable-line @typescript-eslint/naming-convention

    ReactDOMServer.renderToString(<I18nProvider i18n={i18n}><WrappedDummy/></I18nProvider>)

    expect(contextI18n).toBe(i18n)
  })

  test('correctly sets a component display name', function () {
    function Dummy(): null {
      return null
    }

    expect(withI18n(Dummy).displayName).toBe('withI18n(Dummy)')
  })

  test('correctly exposes the wrapped component', function () {
    function Dummy(): null {
      return null
    }

    // @ts-expect-error exposing the wrapped component via the WrappedComponent property is a common pratice
    expect(withI18n(Dummy).WrappedComponent).toBe(Dummy)
  })

  test('hoists static members of the wrapped component', function () {
    class Dummy extends React.Component {
      public static staticTest = true
    }

    // @ts-expect-error can't seem to figure out a way for the types to recognize that the property exists
    expect(withI18n(Dummy).staticTest).toBe(true)
  })
})
