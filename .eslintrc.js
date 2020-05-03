'use strict'

const os = require('os')

module.exports = {
  extends: [
    '@strv/node/v10',
    '@strv/node/optional',
    '@strv/node/style',
  ],

  rules: {
    // If your editor cannot show these to you, occasionally turn this off and run the linter
    'no-warning-comments': 0,

    // This repository is configured so that upon checkout, git should convert line endings to
    // platform-specific defaults and convert them back to LF when checking in. As such, we must
    // enforce CRLF endings on Windows, otherwise the lint task would fail on Windows systems.
    'linebreak-style': ['error', os.platform() === 'win32' ? 'windows' : 'unix'],
  },

  overrides: [{
    files: [
      'src/**/*.ts',
      'test/**/*.ts',
      'test/**/*.test.ts',
    ],

    extends: [
      '@strv/node/v10',
      '@strv/node/optional',
      '@strv/eslint-config-typescript',
      '@strv/eslint-config-typescript/style',
      '@strv/mocha',
    ],

    parserOptions: {
      project: 'tsconfig.json',
    },

    env: {
      // Disable Mocha globals which are enabled in @strv/mocha. We will import the necessary
      // functions directly from 'mocha' package in this project.
      // This is done so that we avoid having all of the Mocha globals being declared even in source
      // files. It is currently not possible to disable these globals for source files but have them
      // available in test files - they are either fully available or not available at all.
      mocha: false,
    },

    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'linebreak-style': ['error', os.platform() === 'win32' ? 'windows' : 'unix'],
    },
  }, {
    files: [
      'test/**/*.ts',
    ],

    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  }],
}
