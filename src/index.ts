import type { Delegate } from './delegate'

type SignalOrExitCode = NodeJS.Signals | number

const SIGNALS: NodeJS.Signals[] = [
  'SIGINT',
  'SIGTERM',
]

/**
 * The process status gatekeeper
 *
 * @param     {Delegate<Runtime>}    delegate   Object or class responsible for acting when the
 *                                              process changes its state
 * @return    {Promise}                         Returns whatever the Delegate's .execute() returns
 */
async function heimdall<Runtime>(delegate: Delegate<Runtime>): Promise<void> {
  const received: SignalOrExitCode[] = []
  let runtime: Runtime

  async function onsignal(signal: SignalOrExitCode): Promise<void> {
    received.push(signal)

    try {
      if (received.length > 1) {
        if (typeof delegate.didReceiveForcequit === 'function') {
          delegate.didReceiveForcequit()
        }

        return void fatal(new Error('Forced quit'))
      }

      await delegate.exit({ runtime })
    } catch (err) {
      return void fatal(err)
    } finally {
      cleanup(onsignal)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  SIGNALS.forEach(sig => void process.on(sig, onsignal))
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.once('beforeExit', onsignal)

  try {
    runtime = await delegate.execute()
  } catch (err) {
    cleanup(onsignal)
    return void fatal(err)
  }
}

function fatal(err: Error|string|number|undefined): void {
  // eslint-disable-next-line no-console
  void (isError(err) ? console.error(err.stack) : console.error(err))

  // Intentionally let the current event loop finish, then terminate the process
  // eslint-disable-next-line no-process-exit
  return void process.nextTick(() => void process.exit(1))
}

function isError(err: Error|string|number|undefined): err is Error {
  return err instanceof Error
}

function cleanup(handler: (signal: SignalOrExitCode) => Promise<void>): void {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  SIGNALS.forEach(sig => void process.removeListener(sig, handler))
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.removeListener('beforeExit', handler)
}

export {
  heimdall,
  Delegate,
}
