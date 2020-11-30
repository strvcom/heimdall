import type * as mocha from 'mocha'
import { mklistenercheck } from './utils'

// eslint-disable-next-line node/no-process-env
process.env.NODE_ENV = 'test'

const mochaHooks: mocha.RootHookObject = {
  beforeAll() {
    // If we are running Mocha in watch mode, clear the Console before each test run so we have only
    // one report on screen at any time. This is how the `min` reporter works by default, but we
    // actually do want to see the full test suite log.
    // PS. I know this is a rather dumb way to check for watch mode but hey, it works 🤷‍♂️
    if (process.argv.includes('--watch')) {
      process.stdout.write('\u001Bc')
      // eslint-disable-next-line no-console
      console.log('Terminal screen cleared in global mocha:before()\n')
    }
  },

  afterAll() {
    mklistenercheck(process, ['SIGINT', 'SIGTERM', 'beforeExit'])
  },
}

export {
  mochaHooks,
}
