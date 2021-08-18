import {
  arrayExpressionType,
  callExpressionType,
  identifierType,
  literalType,
  objectExpressionType,
  templateLiteralType,
} from '../src/constants/ast'
import interpret from '../src/utils/interpreter'
import type { Expression } from '../src/utils/parser'

describe('Interpreter', function () {
  test('correctly interprets a string literal AST', function () {
    const output = interpret([
      {
        type: literalType,
        value: 'foobar',
      },
    ], {})

    expect(output).toMatchSnapshot()
  })

  test('correctly interprets a boolean literal AST', function () {
    const output = interpret([
      {
        type: literalType,
        value: true,
      },
    ], {})

    expect(output).toMatchSnapshot()
  })

  test('correctly interprets a number literal AST', function () {
    const output = interpret([
      {
        type: literalType,
        value: 2.45,
      },
    ], {})

    expect(output).toMatchSnapshot()
  })

  test('correctly interprets a null literal AST', function () {
    const output = interpret([
      {
        type: literalType,
        value: null,
      },
    ], {})

    expect(output).toMatchSnapshot()
  })

  test('correctly interprets an undefined literal AST', function () {
    const output = interpret([
      {
        type: literalType,
        value: undefined,
      },
    ], {})

    expect(output).toMatchSnapshot()
  })

  test('correctly interprets a string template literal AST', function () {
    const output = interpret([
      {
        parts: [
          {
            type: literalType,
            value: 'The quick ',
          },
          {
            name: 'animalColor',
            type: identifierType,
          },
          {
            type: literalType,
            value: ' fox jumps over the lazy dog',
          },
        ],
        type: templateLiteralType,
      },
    ], {
      animalColor: 'brown',
    })

    expect(output).toMatchSnapshot()
  })

  test('correctly interprets an identifier AST', function () {
    const output = interpret([
      {
        name: 'foo',
        type: identifierType,
      },
    ], {
      foo: 'bar',
    })

    expect(output).toMatchSnapshot()
  })

  test('correctly interprets an array AST', function () {
    const output = interpret([
      {
        elements: [
          {
            type: literalType,
            value: 'foo',
          },
          {
            type: literalType,
            value: 'bar',
          },
        ],
        type: arrayExpressionType,
      },
    ], {})

    expect(output).toMatchSnapshot()
  })

  test('correctly interprets an object AST', function () {
    const output = interpret([
      {
        properties: {
          bar: {
            type: literalType,
            value: true,
          },
          foo: {
            type: literalType,
            value: 2.45,
          },
        },
        type: objectExpressionType,
      },
    ], {})

    expect(output).toMatchSnapshot()
  })

  test('correctly interprets a function call AST', function () {
    const tSpy = jest.fn().mockReturnValue('test result')
    const output = interpret([
      {
        arguments: [
          {
            type: literalType,
            value: 'foo.bar',
          },
          {
            properties: {
              bar: {
                type: literalType,
                value: true,
              },
              foo: {
                type: literalType,
                value: 2.45,
              },
            },
            type: objectExpressionType,
          },
        ],
        callee: 't',
        type: callExpressionType,
      },
    ], {
      t: tSpy,
    })

    expect(tSpy).toHaveBeenCalledWith('foo.bar', {
      bar: true,
      foo: 2.45,
    })
    expect(output).toMatchSnapshot()
  })

  test('throws an error for unknown AST types', function () {
    expect(function () {
      interpret([
        ({
          type: 'unknown',
        } as unknown) as Expression,
      ], {})
    }).toThrow('Unknown AST type')
  })
})
