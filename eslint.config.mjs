import nodev20 from '@strv/eslint-config-node/v20'
import nodeopt from '@strv/eslint-config-node/optional'
import nodestyle from '@strv/eslint-config-node/style'
import ts from '@strv/eslint-config-typescript'
import tsoptional from '@strv/eslint-config-typescript/optional'
import tsstyle from '@strv/eslint-config-typescript/style'
import mocha from '@strv/eslint-config-mocha'

const globs = {
  mjs: '**/*.mjs',
  ts: '**/*.ts',
  tests: '**/*.test.ts',
}

/** @type {Array<import("eslint").Linter.FlatConfig>} */
const config = [
  { linterOptions: {
    reportUnusedDisableDirectives: true,
  } },
  { ignores: ['**/*.js', '**/*.d.ts', 'node_modules'] },
  { files: [globs.ts, globs.mjs], ...nodev20 },
  { files: [globs.ts, globs.mjs], ...nodeopt },
  { files: [globs.ts, globs.mjs], ...nodestyle },

  { files: [globs.ts], ...ts },
  { files: [globs.ts], ...tsoptional },
  { files: [globs.ts], ...tsstyle },

  { files: [globs.tests], ...mocha },

  // Any custom settings to be applied
  { files: [globs.ts],
    languageOptions: {
      parserOptions: { project: './tsconfig.json' },
    } },
]

export default config
