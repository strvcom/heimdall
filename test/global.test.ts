import { describe, it, after } from 'mocha'
import * as expect from 'expect'
import { mklistenercheck } from './utils'

const checklisteners = mklistenercheck(process, ['SIGINT', 'SIGTERM', 'beforeExit'])

describe('test environment', () => {
  it('defines NODE_ENV', () => {
    // eslint-disable-next-line no-process-env
    expect(process.env.NODE_ENV).toBe('test')
  })

  it('does not have any signal listeners attached', checklisteners)
})


after(checklisteners)
