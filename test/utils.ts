import type { EventEmitter } from 'events'
import * as sinon from 'sinon'
import * as expect from 'expect'

interface FakeDelegate<Runtime> {
  execute: sinon.SinonStub<[], Promise<Runtime>>
  exit: sinon.SinonStub<[{ runtime?: Runtime }], Promise<void>>
  didReceiveForcequit?: sinon.SinonStub<[], void>
  logError?: sinon.SinonStub<[Error], void>
}

/**
 * Create a fake Delegate for Heimdall to trigger events on it.
 *
 * @private
 */
function mkdelegate<Runtime>(): FakeDelegate<Runtime> {
  return {
    execute: sinon.stub<[], Promise<Runtime>>().resolves(),
    exit: sinon.stub<[{ runtime?: Runtime }], Promise<void>>().resolves(),
    didReceiveForcequit: sinon.stub(),
  }
}

/**
 * Cause the last-added signal handler to be invoked on a Sinon stub
 *
 * @private
 */
async function lastsignalhandler(
  stub: sinon.SinonStub<[string, (event: string) => void], void>,
  signal: NodeJS.Signals | 'beforeExit',
): Promise<void> {
  // Find the last signal handler attached to the stub and call it
  const calls = stub.getCalls().filter(call => call.args[0] === signal)
  const handler = calls.pop()?.args[1]

  if (!handler) {
    throw new Error([
      `No signal handler found for signal ${signal}. `,
      `Total signal handlers registered on this stub: ${String(stub.callCount)}`,
    ].join(''))
  }

  await Promise.resolve(handler(signal))
}

/**
 * Ensure that the number of active signal listeners does not change
 *
 * If the number does change, it means we have attached an event listener that we forgot to clean
 * up. 😱
 *
 * @private
 */
function mklistenercheck(emitter: EventEmitter, events: string[]): () => void {
  const counts = new Map<string, number>()

  for (const event of events) {
    counts.set(event, emitter.listenerCount(event))
  }

  return function checklisteners() {
    for (const event of events) {
      const count = counts.get(event)

      expect(emitter.listenerCount(event)).toEqual(count)
    }
  }
}

/**
 * Delay further execution until the next event loop
 *
 * @private
 */
async function nextloop(): Promise<void> {
  await new Promise(resolve => setImmediate(resolve))
}

export {
  mkdelegate,
  lastsignalhandler,
  mklistenercheck,
  nextloop,
}
