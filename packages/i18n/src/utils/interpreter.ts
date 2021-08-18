import {
  arrayExpressionType,
  callExpressionType,
  identifierType,
  literalType,
  objectExpressionType,
  templateLiteralType,
} from '../constants/ast'
import type {
  ArrayExpression,
  CallExpression,
  Expression,
  Identifier,
  Literal,
  ObjectExpression,
  TemplateLiteral,
} from './parser'

type Locals = {
  [key: string]: any,
}

/**
 * Throw an error when an unknown AST type is encountered.
 */
function onUnknownAstType(): never {
  throw new Error('Unknown AST type')
}

/**
 * Interpret an array AST object.
 *
 * @param astObject - The AST object to be interpreted
 * @param locals - Variables to use in the local context
 * @returns The resulting array from the interpretation
 */
function interpretArray(astObj: ArrayExpression, locals: Locals): unknown[] {
  const { elements } = astObj

  return elements.map(function (elementAst) {
    return interpretAst(elementAst, locals) // eslint-disable-line @typescript-eslint/no-use-before-define
  })
}

/**
 * Interpret a function call AST object.
 *
 * @param astObject - The AST object to be interpreted
 * @param locals - Variables to use in the local context
 * @returns The value returned by the function call
 */
function interpretFunctionCall(astObj: CallExpression, locals: Locals): unknown {
  const { arguments: args, callee } = astObj

  return (locals[callee] as Function)(...interpret(args, locals)) // eslint-disable-line @typescript-eslint/no-use-before-define
}

/**
 * Interpret an identifier AST object.
 *
 * @param astObject - The AST object to be interpreted
 * @param locals - Variables to use in the local context
 * @returns The value stored in the local context with the corresponding identifier name
 */
function interpretIdentifier(astObj: Identifier, locals: Locals): unknown {
  return locals[astObj.name]
}

/**
 * Interpret a literal AST object.
 *
 * @param astObj - The AST object to be interpreted
 * @returns The value of the literal.
 */
function interpretLiteral(astObj: Literal): string | number | boolean | null | undefined {
  return astObj.value
}

/**
 * Interpret an object AST object.
 *
 * @param astObject - The AST object to be interpreted
 * @param locals - Variables to use in the local context
 * @returns The resulting object from the interpretation
 */
function interpretObject(astObj: ObjectExpression, locals: Locals): {
  [key: string]: unknown,
} {
  const { properties } = astObj
  const output: {
    [key: string]: unknown,
  } = {}

  Object.keys(properties).forEach(function (key) {
    output[key] = interpretAst(properties[key], locals) // eslint-disable-line @typescript-eslint/no-use-before-define
  })

  return output
}

/**
 * Interpret a string template literal AST object.
 *
 * @param astObject - The AST object to be interpreted
 * @param locals - Variables to use in the local context
 * @returns The string resulting from rendering the template literal
 */
function interpretTemplateLiteral(astObject: TemplateLiteral, locals: Locals): string {
  const { parts } = astObject

  return interpret(parts, locals).join() // eslint-disable-line @typescript-eslint/no-use-before-define
}

/**
 * Generic AST object interpreter which routes AST objects to the appropriate handlers.
 *
 * @param astObj - The AST object to be interpreted
 * @param locals - Variables to use in the local context
 * @returns The result of the interpretation for the given local context
 */
function interpretAst(astObj: Expression, locals: Locals): unknown {
  const { type } = astObj

  switch (type) {
    case arrayExpressionType:
      return interpretArray(astObj as ArrayExpression, locals)
    case callExpressionType:
      return interpretFunctionCall(astObj as CallExpression, locals)
    case identifierType:
      return interpretIdentifier(astObj as Identifier, locals)
    case literalType:
      return interpretLiteral(astObj as Literal)
    case objectExpressionType:
      return interpretObject(astObj as ObjectExpression, locals)
    case templateLiteralType:
      return interpretTemplateLiteral(astObj as TemplateLiteral, locals)
    default:
      return onUnknownAstType()
  }
}

/**
 * Interpret a translation AST with the given locals.
 * Any function calls will be executed and variable identifiers will be replaced with their values.
 *
 * @param ast - The AST objects that describe the translation string structure
 * @param locals - Variables to use in the local context of the translation
 * @returns An array containing the different parts of the interpretation
 */
export default function interpret(ast: Expression[], locals: Locals): unknown[] {
  return ast.map(function (astObj) {
    return interpretAst(astObj, locals)
  })
}
