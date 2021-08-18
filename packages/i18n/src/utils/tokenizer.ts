import * as moo from 'moo'
import {
  booleanType,
  bracketEndType,
  bracketStartType,
  commaType,
  curlyEndType,
  curlyStartType,
  expressionStartType,
  functionCallType,
  identifierType,
  nullType,
  numberType,
  parenEndType,
  propertyNameType,
  stringType,
  templateEndType,
  templateStartType,
  undefinedType,
} from '../constants/tokens'
import type { Rules, Token } from 'moo'

/**
 * Get the function identifier from a function call.
 *
 * @param value - A value from which to extract the contents
 * @returns A function identifier
 */
function trimFunctionCall(value: string): string {
  return value.replace(/[\s(]/g, '')
}

/**
 * Get the property name from a property declaration.
 *
 * @param value - A value from which to extract the contents
 * @returns A property name
 */
function trimPropertyName(value: string): string {
  return value.replace(/[\s:]/g, '')
}

/**
 * Get the contents from a string expression.
 *
 * @param value - A value from which to extract the contents
 * @returns The contents of a string expression
 */
function trimString(value: string): string {
  return value.trim().slice(1, -1)
}

/**
 * Removes leading and trailing white space characters from a string.
 *
 * @param value - A value to be trimmed
 * @returns The given value without leading or trailing white space characters
 */
function trimValue(value: string): string {
  return value.trim()
}

/* eslint-disable sort-keys */
const states: {
  [state: string]: Rules,
} = {
  body: {
    [expressionStartType]: {
      match: '${',
      push: 'expression',
    },
    [curlyEndType]: {
      match: /\s*\}/,
    },
    [stringType]: {
      lineBreaks: true,
      match: /(?:[^$]|\$(?!\{))+/,
    },
  },
  expression: {
    [stringType]: [
      {
        match: /\s*"(?:\\["\\rn]|[^"\\])*?"\s*/,
        value: trimString,
      },
      {
        match: /\s*'(?:\\['\\rn]|[^'\\])*?'\s*/,
        value: trimString,
      },
    ],
    [bracketStartType]: {
      match: /\s*\[\s*/,
      push: 'expression',
    },
    [bracketEndType]: {
      match: /\s*\]\s*/,
      pop: 1,
    },
    [curlyStartType]: {
      match: /\s*\{\s*/,
      push: 'expression',
    },
    [curlyEndType]: {
      match: /\s*\}(?:\s*(?=[,}\])]))?/,
      pop: 1,
    },
    [parenEndType]: {
      match: /\s*\)\s*/,
      pop: 1,
    },
    [templateStartType]: {
      match: /\s*`/,
      push: 'template',
    },
    [commaType]: {
      match: /\s*,\s*/,
    },
    [booleanType]: {
      match: /\s*(?:true|false)\s*/,
      value: trimValue,
    },
    [nullType]: {
      match: /\s*null\s*/,
    },
    [numberType]: {
      match: /\s*-?\d+(?:\.\d+)?\s*/,
      value: trimValue,
    },
    [undefinedType]: {
      match: /\s*undefined\s*/,
    },
    [functionCallType]: {
      match: /\s*\w+\s*\(\s*/,
      value: trimFunctionCall,
    },
    [propertyNameType]: {
      match: /\s*\w+\s*:\s*/,
      value: trimPropertyName,
    },
    [identifierType]: {
      match: /\s*\w+\s*/,
      value: trimValue,
    },
  },
  template: {
    [expressionStartType]: {
      match: '${',
      push: 'expression',
    },
    [templateEndType]: {
      match: /`\s*/,
      pop: 1,
    },
    [stringType]: {
      lineBreaks: true,
      match: /(?:[^$`]|\$(?!\{))+/,
    },
  },
}
/* eslint-enable sort-keys */

const lexer = moo.states(states)

/**
 * Translate a translation string into tokens.
 *
 * @param input - The translation to be tokenized
 * @returns The tokens that make up the translation string
 */
export default function tokenize(input: string): Token[] {
  return Array.from(lexer.reset(input))
}
