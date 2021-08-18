import {
  currencyStyle,
  decimalStyle,
  percentStyle,
} from '../constants/styles'

const defaultFormat: Intl.NumberFormatOptions = { style: 'decimal' }

export default defaultFormat

export const currency: Intl.NumberFormatOptions = {
  currency: 'USD', // Show `$` as symbol when the currency is unknown
  currencyDisplay: 'narrowSymbol',
  style: currencyStyle,
}

export const decimal: Intl.NumberFormatOptions = {
  minimumFractionDigits: 1,
  style: decimalStyle,
}

export const integer: Intl.NumberFormatOptions = {
  maximumFractionDigits: 0,
  style: decimalStyle,
}

export const percent: Intl.NumberFormatOptions = {
  maximumFractionDigits: 2,
  style: percentStyle,
}
