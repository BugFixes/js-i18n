import * as React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import {
  getComponentName,
} from '@bugfixes/react-utils'
import type {
  PropsWithChildren,
  ReactElement,
} from 'react'
import type I18n from '@bugfixes/i18n'

export type I18nProps = {
  readonly i18n: I18n,
}

export type TProps = {
  [prop: string]: any,
  translationKey: string,
}

const I18nContext = React.createContext<I18n>((null as unknown) as I18n) // eslint-disable-line @typescript-eslint/naming-convention

/**
 * Provides an i18n context that allows using the I18n class in React components.
 *
 * @param props - Provider props including the I18n instance to provide to consumers of the I18n context
 * @public
 *
 * @example
 * ```javascript
 * import * as React from 'react'
 * import I18n from '@bugfixes/i18n'
 * import { I18nProvider } from '@bugfixes/i18n-react'
 *
 * const i18n = new I18n('en-GB', {
 *   translations: {
 *     foobar: 'The quick brown fox jumps over the lazy dog',
 *   },
 * })
 *
 * function Foo(props) {
 *   return (
 *     <I18nProvider i18n={i18n}>
 *       {props.children}
 *     </I18nProvider>
 *   )
 * }
 * ```
 */
export function I18nProvider(
  props: PropsWithChildren<I18nProps>,
): ReactElement {
  const {
    children,
    i18n,
  } = props

  return (
    <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>
  )
}

I18nProvider.displayName = 'I18nProvider'

/**
 * Use the current I18n instance provided by the closest I18n context provider above.
 *
 * @returns The I18n instance currently provided
 * @public
 *
 * @example
 * ```javascript
 * import * as React from 'react'
 * import { useI18n } from '@bugfixes/i18n-react'
 *
 * function Foobar() {
 *   const i18n = useI18n()
 *
 *   return (
 *     <button className="btn">
 *       {i18n.t('clickHere')}
 *     </button>
 *   )
 * }
 * ```
 */
export function useI18n(): I18n {
  return React.useContext(I18nContext)
}

/**
 * Wraps a React component in a HOC which passes the current I18n instance as a prop.
 *
 * @remarks The current I18n instance will be available in the `i18n` prop
 * @param Component - A React component to receive the current I18n instance as a prop
 * @returns A HOC which will add the current I18n instance as a prop to the given React component
 * @public
 *
 * @example
 * ```javascript
 * import * as React from 'react'
 * import { withI18n } from '@bugfixes/i18n-react'
 *
 * function Foobar(props) {
 *   const { i18n } = props
 *
 *   return (
 *     <button className="btn">
 *       {i18n.t('clickHere')}
 *     </button>
 *   )
 * }
 *
 * export default withI18n(Foobar)
 * ```
 */
export function withI18n<T extends Partial<I18nProps>, W = Omit<T, keyof I18nProps>>(
  Component: React.ComponentType<T>, // eslint-disable-line @typescript-eslint/naming-convention
): React.ForwardRefExoticComponent<React.PropsWithoutRef<W> & React.RefAttributes<unknown>> {
  const withForwardedRef = React.forwardRef<unknown, W>( // eslint-disable-line react/no-multi-comp
    function (props: W, ref: unknown): React.ReactElement {
      const i18n = useI18n()
      const combinedProps = {
        ...props,
        i18n,
      }

      return <Component ref={ref} {...(combinedProps as unknown) as T}/> // eslint-disable-line react/jsx-props-no-spreading
    },
  )

  // @ts-expect-error exposing the wrapped component via the WrappedComponent property is a common pratice
  withForwardedRef.WrappedComponent = Component
  withForwardedRef.displayName = `withI18n(${getComponentName(Component)})`

  return hoistNonReactStatics(withForwardedRef, Component)
}

/**
 * A React component that allows to render a translation directly as part of other components.
 *
 * @remarks Like any React component, the translation will only re-render if the props change
 * @param props - The component props will be treated as the translation context
 * @returns The rendered output of the translation
 * @public
 *
 * @example
 * ```javascript
 * import * as React from 'react'
 * import { T } from '@bugfixes/i18n-react'
 *
 * function Foobar() {
 *   return (
 *     <button className="btn">
 *       <T translationKey='clickHere'/>
 *     </button>
 *   )
 * }
 * ```
 */
export function T(props: TProps): React.ReactElement { // eslint-disable-line react/no-multi-comp
  const i18n = useI18n()
  const {
    translationKey,
    ...ctx
  } = props

  return (
    <React.Fragment>{i18n.tToParts(translationKey, ctx)}</React.Fragment>
  )
}
