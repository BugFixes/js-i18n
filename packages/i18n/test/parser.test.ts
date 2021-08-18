import parse from '../src/utils/parser'

describe('Parser', function () {
  test('correctly parses a plain translation body', function () {
    const output = parse('The quick brown fox jumps over the lazy dog')

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated identifier', function () {
    const output = parse('The quick ${animalColor} fox jumps over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated string', function () {
    const output = parse('The quick ${\'brown\'} fox jumps over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated string template', function () {
    const output = parse('The ${`quick ${animalColor} ${animalSpecies}`} jumps over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated number', function () {
    const output = parse('The quick brown fox jumps ${2.5} meters over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated boolean', function () {
    const output = parse('It is ${false} that the quick brown fox jumps over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated null value', function () {
    const output = parse('This is a ${null} interpolation') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated undefined value', function () {
    const output = parse('This is an ${undefined} interpolation') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated function call', function () {
    const output = parse('The quick ${getFoxColor()} fox jumps over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated function call with arguments', function () {
    const output = parse('The quick ${getAnimal(\'fox\', \'brown\')} jumps over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated function call with arguments containing shorthand `undefined` values', function () {
    const output = parse('The quick ${getAnimal(,,)} jumps over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated function call with an array as argument', function () {
    const output = parse('You have ${getTotal([10, 14, 3])} total messages') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated function call with an array containing shorthand `undefined` values as argument', function () {
    const output = parse('You have ${getTotal([,,])} total messages') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('correctly parses a translation body with an interpolated function call with an object as argument', function () {
    const output = parse('The quick ${getAnimal({ color: \'brown\', species: \'fox\' })} jumps over the lazy dog') // eslint-disable-line no-template-curly-in-string

    expect(output).toMatchSnapshot()
  })

  test('throws an error when the syntax is invalid', function () {
    // Expression start without matching closing curly braces
    expect(function () {
      parse('You have ${ total messages')
    }).toThrow('Invalid translation syntax')

    // Object without matching closing curly braces
    expect(function () {
      parse('You have ${{} total messages') // eslint-disable-line no-template-curly-in-string
    }).toThrow('Invalid translation syntax')

    // Object with shorthand property declaration
    expect(function () {
      parse('You have ${{h}} total messages') // eslint-disable-line no-template-curly-in-string
    }).toThrow('Invalid translation syntax')

    // Template literal expression start without matching closing curly braces
    expect(function () {
      parse('You have ${`f${bar`} total messages') // eslint-disable-line no-template-curly-in-string
    }).toThrow('Invalid translation syntax')

    // Template literal closing curly braces without matching opening curly braces
    expect(function () {
      parse('You have ${`f${}}bar`} total messages') // eslint-disable-line no-template-curly-in-string
    }).toThrow('Invalid translation syntax')
  })
})
