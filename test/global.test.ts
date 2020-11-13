import { describe, it, before, after } from 'mocha'
import * as expect from 'expect'
import { mklistenercheck } from './utils'

const checklisteners = mklistenercheck(process, ['SIGINT', 'SIGTERM', 'beforeExit'])

describe('test environment', () => {
  it('defines NODE_ENV', () => {
    // eslint-disable-next-line node/no-process-env
    expect(process.env.NODE_ENV).toBe('test')
  })

  it('does not have any signal listeners attached', checklisteners)
})

before(() => {
  // If we are running Mocha in watch mode, clear the Console before each test run so we have only
  // one report on screen at any time. This is how the `min` reporter works by default, but we
  // actually do want to see the full test suite log.
  // PS. I know this is a rather dumb way to check for watch mode but hey, it works 🤷‍♂️
  if (process.argv.includes('--watch')) {
    process.stdout.write('\u001Bc')
    // eslint-disable-next-line no-console
    console.log('Terminal screen cleared in global mocha:before()\n')
  }
})

after(checklisteners)
