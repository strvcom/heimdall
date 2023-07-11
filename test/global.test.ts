import { describe, it } from 'mocha'
import { expect } from 'expect'
import { mklistenercheck } from './utils'

describe('test environment', () => {
  it('defines NODE_ENV', () => {
    // eslint-disable-next-line node/no-process-env
    expect(process.env.NODE_ENV).toBe('test')
  })

  it('does not have any signal listeners attached', mklistenercheck(process, [
    'SIGINT',
    'SIGTERM',
    'beforeExit',
  ]))
})
