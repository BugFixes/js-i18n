const typescript = require('@rollup/plugin-typescript')
const commonjs = require('@rollup/plugin-commonjs')
const {
  babel,
} = require('@rollup/plugin-babel')
const baseConfig = require('../../rollup.config')
const pkg = require('./package.json')

module.exports = [
  {
    ...baseConfig,
    input: './src/index.ts',
    output: {
      file: pkg.main,
      format: 'cjs',
    },
    plugins: [
      typescript(),
      commonjs(),
      babel({
        babelHelpers: 'runtime',
        extensions: [
          '.ts'
        ],
        presets: [[
          '@bugfixes',
          {
            useRuntimeESModules: false,
          }
        ]]
      })
    ]
  },
  {
    ...baseConfig,
    input: './src/index.ts',
    output: {
      file: pkg.module,
      format: 'es'
    }
  }
]


