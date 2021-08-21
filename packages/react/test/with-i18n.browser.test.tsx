/**
 * @jest-environment jsdom
 */
import * as React from 'react'
import ReactDOM from 'react-dom'
import I18n from '@bugfixes/i18n'
import {
  I18nProvider,
  withI18n,
} from '../src'

describe('withI18n HOC', function () {
  const i18n = new I18n('en-GB')

  beforeEach(function () {
    document.body.innerHTML = '<div id="app"></div>'
  })

  test('forwards a ref to the wrapped component', function () {
    let wrappedInstance
    let ref

    class Dummy extends React.Component {
      constructor(props: any) {
        super(props)

        wrappedInstance = this // eslint-disable-line consistent-this
      }

      public render(): null {
        return null
      }
    }

    const WrappedDummy = withI18n(Dummy) // eslint-disable-line @typescript-eslint/naming-convention

    function RefGetter(): React.ReactElement {
      ref = React.useRef()

      return <WrappedDummy ref={ref}/>
    }

    ReactDOM.render(<I18nProvider i18n={i18n}><RefGetter/></I18nProvider>, document.getElementById('app'))

    expect(wrappedInstance).not.toBeUndefined()

    // @ts-expect-error Doing some hacky stuff just for the purpose of testing
    expect(ref?.current).toBe(wrappedInstance)
  })
})
