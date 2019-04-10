'use strict'

module.exports = {
  parser: 'babel-eslint',

  extends: [
    '@strv/node/v10',
    '@strv/node/optional',
    '@strv/node/style',
    '@strv/mocha',
  ],

  rules: {
    // If your editor cannot show these to you, occasionally turn this off and run the linter
    'no-warning-comments': 0,

    'node/no-unsupported-features/es-syntax': ['error', {
      ignores: ['modules'],
    }],
  },

  overrides: [{
    files: [
      '**/*.test.mjs',
    ],

    rules: {
      'max-classes-per-file': 'off',
    },
  }],
}
