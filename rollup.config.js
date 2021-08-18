const typescript = require('@rollup/plugin-typescript')
const commonjs = require('@rollup/plugin-commonjs')
const {
  babel,
} = require('@rollup/plugin-babel')

module.exports = {
  external: [
    /@babel\/runtime/,
    /core-js/,
    /@bugfixes\//,
    'accepts',
    'deepmerge',
    'express',
    'fs/promises',
    'hoist-non-react-statics',
    'moo',
    'path',
    'react',
    'react/jsx-runtime',
  ],
  plugins: [
    typescript(),
    commonjs(),
    babel({
      babelHelpers: 'runtime',
      extensions: [
        '.ts',
        '.tsx',
      ],
      presets: [
        [
          '@bugfixes',
          {
            useRuntimeESModules: true,
          },
        ],
      ],
    }),
  ],
}
