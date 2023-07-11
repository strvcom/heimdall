'use strict'

const os = require('os')

const lbstyle = os.platform() === 'win32' ? 'windows' : 'unix'

/** @type {import("eslint").Linter.Config} */
module.exports = {
  reportUnusedDisableDirectives: true,

  extends: [
    '@strv/node/v20',
    '@strv/node/optional',
    '@strv/node/style',
  ],

  ignorePatterns: [
    '*.js',
    '*.d.ts',
    '!.*.js',
    '!*.config.js',
    'node_modules',
  ],

  rules: {
    // If your editor cannot show these to you, occasionally turn this off and run the linter
    'no-warning-comments': 0,

    // This repository is configured so that upon checkout, git should convert line endings to
    // platform-specific defaults and convert them back to LF when checking in. As such, we must
    // enforce CRLF endings on Windows, otherwise the lint task would fail on Windows systems.
    'linebreak-style': ['error', lbstyle],
  },

  overrides: [{
    files: [
      '**/*.ts',
    ],

    extends: [
      '@strv/node/v20',
      '@strv/node/optional',
      '@strv/typescript',
      '@strv/typescript/style',
    ],

    parserOptions: {
      project: 'tsconfig.json',
    },

    rules: {
      'linebreak-style': ['error', lbstyle],
    },
  }, {
    files: [
      '**/*.test.ts',
    ],
    extends: [
      '@strv/mocha',
    ],
    env: {
      // Disable Mocha globals which are enabled in @strv/mocha. We will import the necessary
      // functions directly from 'mocha' package in this project.
      // This is done so that we avoid having all of the Mocha globals being declared even in source
      // files. It is currently not possible to disable these globals for source files but have them
      // available in test files - they are either fully available or not available at all.
      mocha: false,
    },
  }],
}
