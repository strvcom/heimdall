import node from '@strv/eslint-config-node'
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

/** @type {Array<import("eslint").Linter.Config>} */
const config = [
  { linterOptions: {
    reportUnusedDisableDirectives: true,
  } },
  { ignores: ['**/*.js', '**/*.d.ts', 'node_modules'] },
  { files: [globs.ts, globs.mjs], ...node },
  { files: [globs.ts, globs.mjs], ...nodeopt },
  { files: [globs.ts, globs.mjs], ...nodestyle },

  { files: [globs.ts], ...ts },
  { files: [globs.ts], ...tsoptional },
  { files: [globs.ts], ...tsstyle },

  { files: [globs.tests], ...mocha },
]

export default config
