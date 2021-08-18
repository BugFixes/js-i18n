import tokenize from '../src/utils/tokenizer'
import type {
  Token,
} from 'moo'

type SimplifiedToken = {
  type?: string,
  value: string,
}

/**
 * Simplifies the token data to only contain useful information
 *
 * @param tokens - An array of tokens to simplify
 * @returns An array of tokens containing only the `type` and `value` properties
 */
function simplifyTokens(tokens: Token[]): SimplifiedToken[] {
  return tokens.map(function ({ type, value }) {
    return {
      type,
      value,
    }
  })
}

describe('Tokenizer', function () {
  test('correctly tokenizes a plain translation body', function () {
    const output = tokenize('The quick brown fox jumps over the lazy dog')

    expect(simplifyTokens(output)).toMatchSnapshot()
  })

  test('correctly tokenizes a translation body with an interpolated identifier', function () {
    const output = tokenize('The quick ${foxColour} fox jumps over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(simplifyTokens(output)).toMatchSnapshot()
  })

  test('correctly tokenizes a translation body with an interpolated function call', function () {
    const output = tokenize('The quick ${getSubject()} jumps over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(simplifyTokens(output)).toMatchSnapshot()
  })

  test('correctly tokenizes a translation body with an interpolated function call containing arguments', function () {
    const output = tokenize('The quick ${t(\'foo.bar\', { count: 2, name: \'Foobar\', locales: [\'en-GB\', \'pt-PT\'], { meta: { test: true } } })} jumps over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(simplifyTokens(output)).toMatchSnapshot()
  })

  test('throws an error if unsupported or invalid syntax is used', function () {
    expect(function () {
      tokenize('The quick brown fox ${const foo = \'bar\'} over the lazy dog') // eslint-disable-line no-template-curly-in-string
    }).toThrow()
  })
})
