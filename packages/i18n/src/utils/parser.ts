import {
  arrayExpressionType,
  callExpressionType,
  identifierType,
  literalType,
  objectExpressionType,
  templateLiteralType,
} from '../constants/ast'
import {
  booleanType as booleanTokenType,
  bracketEndType as bracketEndTokenType,
  bracketStartType as bracketStartTokenType,
  commaType as commaTokenType,
  curlyEndType as curlyEndTokenType,
  curlyStartType as curlyStartTokenType,
  expressionStartType as expressionStartTokenType,
  functionCallType as functionCallTokenType,
  identifierType as identifierTokenType,
  nullType as nullTokenType,
  numberType as numberTokenType,
  parenEndType as parenEndTokenType,
  propertyNameType as propertyNameTokenType,
  stringType as stringTokenType,
  templateEndType as templateEndTokenType,
  templateStartType as templateStartTokenType,
  undefinedType as undefinedTokenType,
} from '../constants/tokens'
import tokenize from './tokenizer'
import type {
  Token,
} from 'moo'

export type Literal = {
  type: typeof literalType,
  value?: string | boolean | null | number,
}

export type TemplateLiteral = {
  parts: Expression[],
  type: typeof templateLiteralType,
}

export type ArrayExpression = {
  elements: Expression[],
  type: typeof arrayExpressionType,
}

export type ObjectExpression = {
  properties: {
    [key: string]: Expression,
  },
  type: typeof objectExpressionType,
}

export type Identifier = {
  name: string,
  type: typeof identifierType,
}

export type CallExpression = {
  arguments: Expression[],
  callee: string,
  type: typeof callExpressionType,
}

export type Expression = CallExpression
  | Literal
  | TemplateLiteral
  | ObjectExpression
  | ArrayExpression
  | Identifier

/**
 * Throw an error when invalid syntax is encountered.
 */
function onInvalidSyntax(): never {
  throw new Error('Invalid translation syntax')
}

/**
 * Parse an identifier token into its corresponding AST object.
 *
 * @param tokens - A list of tokens remaining to be parsed
 * @returns An identifier AST object
 */
function parseIdentifier(tokens: Token[]): Identifier {
  const { value } = tokens.shift() as Token

  return {
    name: value,
    type: identifierType,
  }
}

/**
 * Parses supported literal value tokens into their corresponding AST objects.
 *
 * @param tokens - A list of tokens remaining to be parsed
 * @returns A literal value AST object
 */
function parseLiteral(tokens: Token[]): Literal {
  const { type, value } = tokens.shift() as Token
  let parsedValue

  switch (type) {
    case booleanTokenType:
      parsedValue = value === 'true'
      break
    case nullTokenType:
      parsedValue = null
      break
    case numberTokenType:
      parsedValue = parseFloat(value)
      break
    case undefinedTokenType:
      parsedValue = undefined
      break
    default:
      parsedValue = value
  }

  return {
    type: literalType,
    value: parsedValue,
  }
}

/**
 * Parses an array and array element tokens into their corresponding AST objects.
 *
 * @param tokens - A list of tokens remaining to be parsed
 * @returns An array AST object
 */
function parseArray(tokens: Token[]): ArrayExpression {
  tokens.shift() // Remove the opening bracket from the tokens

  const elements: Expression[] = []
  const firstToken = tokens[0]
  let expressionOpen = true

  // Handle `undefined` shorthand as first element
  if (firstToken.type === commaTokenType) {
    elements.push({
      type: literalType,
      value: undefined,
    })
  }

  while (tokens.length && expressionOpen) {
    const token = tokens[0]
    const nextToken = tokens[1]

    switch (token.type) {
      case commaTokenType:
        // Handle `undefined` shorthand
        if (typeof nextToken !== undefinedTokenType
          && (nextToken.type === commaTokenType || nextToken.type === parenEndTokenType)
        ) {
          elements.push({
            type: literalType,
            value: undefined,
          })
        }

        tokens.shift()

        break

      // Handle the closing of the array
      case bracketEndTokenType:
        expressionOpen = false
        tokens.shift()

        break

      // Handle array elements
      default:
        elements.push(parseExpression(tokens)) // eslint-disable-line @typescript-eslint/no-use-before-define
    }
  }

  return {
    elements: elements,
    type: arrayExpressionType,
  }
}

/**
 * Parses an object and key-value pair tokens into their corresponding AST objects.
 *
 * @param tokens - A list of tokens remaining to be parsed
 * @returns An object AST object
 */
function parseObject(tokens: Token[]): ObjectExpression {
  tokens.shift() // Remove the opening curly brace from the tokens

  const props: {
    [key: string]: Expression,
  } = {}
  let expressionOpen = true

  while (tokens.length && expressionOpen) {
    const token = tokens.shift() as Token

    switch (token.type) {
      case commaTokenType:
        break

      // Handle the closing of the object
      case curlyEndTokenType:
        expressionOpen = false

        break

      // Handle key and value pairs
      default:
        if (token.type !== propertyNameTokenType) {
          return onInvalidSyntax()
        }

        props[token.value] = parseExpression(tokens) // eslint-disable-line @typescript-eslint/no-use-before-define
    }
  }

  return {
    properties: props,
    type: objectExpressionType,
  }
}

/**
 * Parses a function call and argument tokens into their corresponding AST objects.
 *
 * @param tokens - A list of tokens remaining to be parsed
 * @returns A function call AST object
 */
function parseFunctionCall(tokens: Token[]): CallExpression {
  const fnCall = tokens.shift() as Token
  const args: Expression[] = []
  const firstToken = tokens[0]
  let expressionOpen = true

  // Handle `undefined` shorthand as first argument
  if (firstToken.type === commaTokenType) {
    args.push({
      type: literalType,
      value: undefined,
    })
  }

  while (tokens.length && expressionOpen) {
    const token = tokens[0]
    const nextToken = tokens[1]

    switch (token.type) {
      case commaTokenType:
        // Handle `undefined` shorthand
        if (typeof nextToken !== 'undefined' && (nextToken.type === commaTokenType || nextToken.type === 'parenEnd')) {
          args.push({
            type: literalType,
            value: undefined,
          })
        }

        tokens.shift()

        break

      // Handle the closing of the function call
      case 'parenEnd':
        expressionOpen = false
        tokens.shift()

        break

      // Handle arguments
      default:
        args.push(parseExpression(tokens)) // eslint-disable-line @typescript-eslint/no-use-before-define
    }
  }

  return {
    arguments: args,
    callee: fnCall.value,
    type: callExpressionType,
  }
}

/**
 * Parses a string template literal and expression tokens into their corresponding AST objects.
 *
 * @param tokens - A list of tokens remaining to be parsed
 * @returns A string template literal AST object
 */
function parseTemplateLiteral(tokens: Token[]): TemplateLiteral {
  tokens.shift() // Remove the opening back tick from the tokens

  const parts: Expression[] = []
  let templateOpen = true
  let expressionOpen = false

  while (tokens.length && templateOpen) {
    const token = tokens[0]

    switch (token.type) {
      case stringTokenType:
        parts.push(parseLiteral(tokens))

        break

      // Handle the closing of the template literal
      case templateEndTokenType:
        if (expressionOpen) {
          return onInvalidSyntax()
        }

        templateOpen = false
        tokens.shift()

        break
      case expressionStartTokenType:
        expressionOpen = true
        tokens.shift()
        parts.push(parseExpression(tokens)) // eslint-disable-line @typescript-eslint/no-use-before-define

        break
      case curlyEndTokenType:
        expressionOpen = false
        tokens.shift()

        break
      default:
        return onInvalidSyntax()
    }
  }

  return {
    parts: parts,
    type: templateLiteralType,
  }
}

/**
 * Parses an expression into its corresponding AST object.
 *
 * @param tokens - A list of tokens remaining to be parsed
 * @returns An appropriate AST object for the expression
 */
function parseExpression(tokens: Token[]): Expression {
  const token = tokens[0]

  switch (token.type) {
    case identifierTokenType:
      return parseIdentifier(tokens)
    case functionCallTokenType:
      return parseFunctionCall(tokens)
    case bracketStartTokenType:
      return parseArray(tokens)
    case curlyStartTokenType:
      return parseObject(tokens)
    case templateStartTokenType:
      return parseTemplateLiteral(tokens)
    default:
      return parseLiteral(tokens)
  }
}

/**
 * Parse a translation string into its AST.
 *
 * @remarks Although based on ESTree, the AST objects do not follow those conventions
 * @param input - A translation string to be parsed
 * @returns A sequence of AST objects that describe the translation string structure
 */
export default function parse(input: string): Expression[] {
  const tokens = tokenize(input)
  const output = []

  while (tokens.length) {
    const token = tokens[0]

    switch (token.type) {
      case 'string':
        output.push(parseLiteral(tokens))

        break
      case expressionStartTokenType:
        tokens.shift()
        output.push(parseExpression(tokens))

        break
      case curlyEndTokenType:
        tokens.shift()

        break
      default:
        return onInvalidSyntax()
    }
  }

  return output
}
