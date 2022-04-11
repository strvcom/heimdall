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

        return fatal(delegate, new Error('Forced quit'))
      }

      await delegate.exit({ runtime })
    } catch (err) {
      return fatal(delegate, err)
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
    return fatal(delegate, err)
  }

  if (delegate.exitAfterExecute) {
    await delegate.exit({ runtime })
    cleanup(onsignal)
  }
}

function fatal(delegate: Delegate<unknown>, err: unknown): void {
  // User code can potentially throw anything, so we check if it's actually an Error and if not, we
  // make one.
  const error = err instanceof Error
    ? err
    : new Error(String(err))

  if (typeof delegate.logError === 'function') {
    delegate.logError(error)
  } else {
    // eslint-disable-next-line no-console
    console.error(error.stack)
  }

  // Intentionally let the current event loop finish, then terminate the process
  // eslint-disable-next-line node/no-process-exit
  return process.nextTick(() => void process.exit(1))
}

function cleanup(handler: (signal: SignalOrExitCode) => Promise<void>): void {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  SIGNALS.forEach(sig => void process.removeListener(sig, handler))
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.removeListener('beforeExit', handler)
}

export type {
  Delegate,
}

export {
  heimdall,
}
