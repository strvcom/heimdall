import { describe, it, before, after, beforeEach } from 'mocha'
import * as expect from 'expect'
import * as sinon from 'sinon'
import { heimdall } from '..'
import { mkdelegate, lastsignalhandler, nextloop } from './utils'

type SignalHandlerStub = sinon.SinonStub<[string, (event: string) => void], void>
type ProcessExitStub = sinon.SinonStub<[number?], void>

interface Stubs {
  process: {
    on: SignalHandlerStub
    once: SignalHandlerStub
    removeListener: SignalHandlerStub
    exit: ProcessExitStub
  }
  console: {
    // We only use the console.error method to log actual errors so we type it like that
    error: sinon.SinonStub<[string?, ...unknown[]], void>
  }
}


describe('Heimdall', () => {
  let stubs: Stubs

  before(() => {
    stubs = {
      process: {
        on: sinon.stub(process, 'on') as unknown as SignalHandlerStub,
        once: sinon.stub(process, 'once') as unknown as SignalHandlerStub,
        removeListener: sinon.stub(process, 'removeListener') as unknown as SignalHandlerStub,
        exit: sinon.stub(process, 'exit') as unknown as ProcessExitStub,
      },
      console: {
        error: sinon.stub(console, 'error'),
      },
    }
  })

  after(() => {
    sinon.restore()
  })

  beforeEach(() => {
    Object.values(stubs.process)
      .forEach(stub => stub.resetHistory())
    stubs.console.error.resetHistory()
  })


  it('exists', () => {
    expect(typeof heimdall).toBe('function')
  })

  it('calls .execute() on the delegate', async () => {
    const delegate = mkdelegate()
    await heimdall(delegate)

    expect(delegate.execute.callCount).toBe(1)
  })


  describe('POSIX signals', () => {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']

    // eslint-disable-next-line mocha/no-setup-in-describe
    void signals.forEach(signal => {
      describe(signal, () => {
        it(`${signal} triggers delegate.exit()`, async () => {
          const delegate = mkdelegate()
          await heimdall(delegate)
          await lastsignalhandler(stubs.process.on, signal)

          expect(delegate.exit.callCount).toBe(1)
        })

        it(`a second ${signal} signal triggers .didReceiveForcequit()`, async () => {
          const delegate = mkdelegate()
          // A promise that never resolves, to prevent the .exit() function from letting Heimdall
          // clean its listeners up
          delegate.exit.returns(new Promise(() => {}))
          await heimdall(delegate)

          // Shut up, ESLint, I really want this to throw asynchronously into my face if it blows 🔥
          lastsignalhandler(stubs.process.on, signal).catch(err => {
            throw err
          })
          // This signal handler is expected to throw a "force quit" error but we do not want that
          // to happen here
          lastsignalhandler(stubs.process.on, signal).catch(() => {})

          // .exit() should be called only once
          expect(delegate.exit.callCount).toBe(1)
          expect(delegate.didReceiveForcequit.callCount).toBe(1)
        })

        it(`${signal} does not trigger .didReceiveForcequit() when not implemented`, async () => {
          const delegate = mkdelegate()
          delete delegate.didReceiveForcequit

          await heimdall(delegate)
          // Shut up, ESLint, I really want this to throw asynchronously into my face if it blows 🔥
          lastsignalhandler(stubs.process.on, signal).catch(err => {
            throw err
          })

          const error: Error | null = await new Promise(resolve =>
            void lastsignalhandler(stubs.process.on, signal)
              .then(() => resolve(null))
              .catch(resolve))

          // It should not be a TypeError where we try to call a non-existent function
          expect(error).not.toBeInstanceOf(TypeError)
          expect(String(error?.message)).not.toMatch(/didReceiveForcequit is not a function/giu)
        })

        it(`forces the process to exit on second ${signal} signal`, async () => {
          expect(stubs.process.exit.callCount).toBe(0)

          const delegate = mkdelegate()
          await heimdall(delegate)
          await lastsignalhandler(stubs.process.on, signal)
          await lastsignalhandler(stubs.process.on, signal)
          // exiting occurs in the next event loop so we wait till the next one
          await nextloop()

          expect(stubs.process.exit.callCount).toBe(1)
          expect(stubs.process.exit.lastCall.args[0]).toBe(1)
        })

        it(`logs a termination message to stderr on second ${signal} signal`, async () => {
          expect(stubs.console.error.callCount).toBe(0)

          const delegate = mkdelegate()
          await heimdall(delegate)
          await lastsignalhandler(stubs.process.on, signal)
          await lastsignalhandler(stubs.process.on, signal)

          expect(stubs.console.error.callCount).toBe(1)

          const stack = stubs.console.error.lastCall.args[0]
          expect(stack).toMatch(/forced quit/giu)
        })

        it('removes the signal handlers when delegate exits cleanly', async () => {
          expect(stubs.process.removeListener.callCount).toBe(0)

          const delegate = mkdelegate()
          await heimdall(delegate)

          await lastsignalhandler(stubs.process.on, signal)

          // It should be called one extra time because it should also remove the 'beforeExit'
          // handler in addition to the two signals we are testing here ⚠️
          expect(stubs.process.removeListener.callCount).toBe(signals.length + 1)
        })
      })
    })
  })


  describe('event: beforeExit', () => {
    it('triggers delegate.exit()', async () => {
      const delegate = mkdelegate()

      await heimdall(delegate)
      await lastsignalhandler(stubs.process.once, 'beforeExit')

      expect(delegate.exit.callCount).toBe(1)
    })
  })


  describe('forced shutdown', () => {
    it('occurs in the next event loop', async () => {
      const delegate = mkdelegate()
      delegate.exit.returns(new Promise(() => {}))

      await heimdall(delegate)
      lastsignalhandler(stubs.process.on, 'SIGINT').catch(() => {})
      lastsignalhandler(stubs.process.on, 'SIGINT').catch(() => {})

      expect(delegate.didReceiveForcequit.callCount).toBe(1)
      expect(stubs.process.exit.callCount).toBe(0)

      await nextloop()

      expect(stubs.process.exit.callCount).toBe(1)
    })
  })


  describe('broken Delegate implementation', () => {
    it('error in .exit() shuts down the process and logs the stack trace', async () => {
      expect(stubs.console.error.callCount).toBe(0)
      expect(stubs.process.exit.callCount).toBe(0)

      const delegate = mkdelegate()
      delegate.exit.callsFake(() => {
        throw new Error('fake .exit() failed')
      })

      await heimdall(delegate)
      await lastsignalhandler(stubs.process.on, 'SIGINT')
      await nextloop()

      expect(stubs.console.error.callCount).toBe(1)
      expect(stubs.process.exit.callCount).toBe(1)
    })

    it('error in .execute() shuts down the process and logs the stack trace', async () => {
      expect(stubs.console.error.callCount).toBe(0)
      expect(stubs.process.exit.callCount).toBe(0)

      const delegate = mkdelegate()
      delegate.execute.callsFake(() => {
        throw new Error('fake .execute() failed')
      })

      await heimdall(delegate)
      await lastsignalhandler(stubs.process.on, 'SIGINT')
      await nextloop()

      expect(stubs.console.error.callCount).toBe(1)
      expect(stubs.process.exit.callCount).toBe(1)
    })
  })


  describe('.logError() is implemented', () => {
    it('is used when .exit() fails', async () => {
      const delegate = mkdelegate()
      delegate.logError = sinon.stub()
      delegate.exit.callsFake(() => {
        throw new Error('fake .exit() failed')
      })

      await heimdall(delegate)
      await lastsignalhandler(stubs.process.on, 'SIGINT')

      expect(stubs.console.error.callCount).toBe(0)
      expect(delegate.logError.callCount).toBe(1)
      expect(delegate.logError.lastCall.args[0])
        .toHaveProperty('message', 'fake .exit() failed')
    })

    it('is used when .execute() fails', async () => {
      const delegate = mkdelegate()
      delegate.logError = sinon.stub()
      delegate.execute.callsFake(() => {
        throw new Error('fake .execute() failed')
      })

      await heimdall(delegate)

      expect(stubs.console.error.callCount).toBe(0)
      expect(delegate.logError.callCount).toBe(1)
      expect(delegate.logError.lastCall.args[0])
        .toHaveProperty('message', 'fake .execute() failed')
    })

    it('is used when a second signal is received', async () => {
      const delegate = mkdelegate()
      delegate.logError = sinon.stub()
      delegate.exit.returns(new Promise(() => {}))

      await heimdall(delegate)
      lastsignalhandler(stubs.process.on, 'SIGINT').catch(() => {})
      lastsignalhandler(stubs.process.on, 'SIGINT').catch(() => {})
      await nextloop()

      expect(stubs.console.error.callCount).toBe(0)
      expect(delegate.logError.callCount).toBe(1)
      expect(delegate.logError.lastCall.args[0])
        .toHaveProperty('message', 'Forced quit')
    })
  })
})
