import * as expect from 'expect'
import * as sinon from 'sinon'
import { heimdall } from '../..'

/**
 * @typedef   DelegateStub
 *
 * @property  {sinon.SinonFake}   execute
 * @property  {sinon.SinonFake}   exit
 * @property  {sinon.SinonFake}   didReceiveForcequit
 */

describe('heimdall', () => {
  /** @type {DelegateStub} */
  let delegate

  beforeEach(() => {
    sinon.stub(process, 'once')
    sinon.stub(process, 'removeListener')
    sinon.stub(process, 'exit')
    sinon.stub(console, 'error')

    delegate = {
      execute: sinon.stub(),
      exit: sinon.stub(),
      didReceiveForcequit: sinon.stub(),
    }
  })

  afterEach(() => {
    sinon.restore()
    delete process.exitCode
  })


  it('exists', () => {
    expect(typeof heimdall).toBe('function')
  })

  it('calls .execute() on the delegate', () => {
    heimdall(delegate)

    expect(delegate.execute.callCount).toBe(1)
  })


  describe('signal', () => {
    it('calls .exit() on the delegate', () => {
      heimdall(delegate)

      const onsignal = process.once.getCalls().find(call => call.args[0] === 'SIGINT').args[1]
      onsignal()

      expect(delegate.exit.callCount).toBe(1)
    })

    it('calls .didReceiveForcequit() on second signal', () => {
      delegate.exit.returns(new Promise(() => {}))

      heimdall(delegate)

      const onsignal = process.once.getCalls().find(call => call.args[0] === 'SIGINT').args[1]
      onsignal()
      const forcequit = process.once.lastCall.args[1]

      new Promise(() => forcequit()).catch(() => {})

      expect(delegate.didReceiveForcequit.callCount).toBe(1)
    })

    it('does not call .didReceiveForcequit() when not implemented', async () => {
      delete delegate.didReceiveForcequit

      heimdall(delegate)

      const onsignal = process.once.getCalls().find(call => call.args[0] === 'SIGINT').args[1]
      onsignal()
      const forcequit = process.once.lastCall.args[1]

      const err = await new Promise(resolve => {
        try {
          forcequit()
        } catch (error) {
          return void resolve(error)
        }
      })

      expect(err.message).not.toMatch(/delegate.didReceiveForcequit is not a function/gu)
    })
  })


  describe('clean exit', () => {
    it('calls .exit() on the delegate', () => {
      heimdall(delegate)

      const onexit = process.once.getCalls().find(call => call.args[0] === 'beforeExit').args[1]

      onexit()

      expect(delegate.exit.callCount).toBe(1)
    })
  })

  describe('error in a delegate', () => {
    /** @type {sinon.SinonFakeTimers} */
    let clock

    beforeEach(() => {
      clock = sinon.useFakeTimers({ toFake: ['setTimeout'] })
    })

    afterEach(() => {
      clock.restore()
    })


    it('is handled for .execute()', async () => {
      const error = new Error('fail from execute')
      delegate.execute.rejects(error)

      await heimdall(delegate)

      clock.tick(12000)

      expect(process.exitCode).toBe(1)
      expect(process.exit.callCount).toBe(1)
      // eslint-disable-next-line no-console
      expect(console.error.lastCall.args[0]).toBe(error.stack)
    })

    it('is handled for .exit()', async () => {
      const error = new Error('fail from exit')
      delegate.exit.rejects(error)

      heimdall(delegate)

      const onsignal = process.once.getCalls().find(call => call.args[0] === 'SIGINT').args[1]
      await onsignal()

      clock.tick(12000)

      expect(process.exitCode).toBe(1)
      expect(process.exit.callCount).toBe(1)
      // eslint-disable-next-line no-console
      expect(console.error.lastCall.args[0]).toBe(error.stack)
    })
  })
})
