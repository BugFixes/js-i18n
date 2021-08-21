import * as React from 'react'
import ReactDOMServer from 'react-dom/server'
import I18n from '@bugfixes/i18n'
import {
  I18nProvider,
  T,
} from '../src'

describe('T component', function () {
  const i18n = new I18n('en-GB', {
    translations: {
      basic: 'The quick brown fox jumps over the lazy dog',
      children: 'Please ${children} to open the page', // eslint-disable-line no-template-curly-in-string
      placeholder: 'The quick ${foxColor} fox jumps over the lazy dog', // eslint-disable-line no-template-curly-in-string
    },
  })

  test('renders the output of a translation', function () {
    const output = ReactDOMServer.renderToString(
      <I18nProvider i18n={i18n}>
        <T translationKey='basic'/>
      </I18nProvider>,
    )

    expect(output).toMatchSnapshot()
  })

  test('renders the output of a translation with placeholders', function () {
    const output = ReactDOMServer.renderToString(
      <I18nProvider i18n={i18n}>
        <T foxColor='brown' translationKey='placeholder'/>
      </I18nProvider>,
    )

    expect(output).toMatchSnapshot()
  })

  test('renders the output of a translation with children', function () {
    function Link(): React.ReactElement {
      return <a href='https://www.bugfix.es/'>Click here</a>
    }

    const output = ReactDOMServer.renderToString(
      <I18nProvider i18n={i18n}>
        <T translationKey='children'>
          <Link/>
        </T>
      </I18nProvider>,
    )

    expect(output).toMatchSnapshot()
  })
})
