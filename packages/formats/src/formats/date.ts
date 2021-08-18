import {
  longFormat,
  numericFormat,
  shortFormat,
  twoDigitFormat,
} from '../constants/formats'

const defaultFormat: Intl.DateTimeFormatOptions = {
  day: twoDigitFormat,
  month: twoDigitFormat,
  year: numericFormat,
}

export default defaultFormat

export const short: Intl.DateTimeFormatOptions = defaultFormat

export const medium: Intl.DateTimeFormatOptions = {
  day: numericFormat,
  month: shortFormat,
  year: numericFormat,
}

export const long: Intl.DateTimeFormatOptions = {
  day: numericFormat,
  month: longFormat,
  year: numericFormat,
}

export const full: Intl.DateTimeFormatOptions = {
  day: numericFormat,
  month: longFormat,
  weekday: longFormat,
  year: numericFormat,
}
