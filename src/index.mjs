/**
 * @typedef   Delegate
 * @property  {function}  execute               Function invoked when heimdall receives the delegate
 * @property  {function}  exit                  Function invoked when the process is about to exit
 * @property  {function}  didReceiveForcequit   Function invoked when the process received a
 *                                              terminating signal more than once
 */

/**
 * The process status gatekeeper
 *
 * @param     {Delegate}    delegate    Object or class responsible for acting when the process
 *                                      changes its state
 * @return    {Promise}                 Returns whatever the Delegate's .execute() returns
 */
function heimdall(delegates) {
  async function onexit() {
    process.removeListener('SIGINT', onsignal)
    process.removeListener('SIGTERM', onsignal)
    process.removeListener('beforeExit', onexit)

    try {
      await delegate.exit()
    } catch (err) {
      return void fatal(err)
    } finally {
      process.removeListener('SIGINT', forcequit)
      process.removeListener('SIGTERM', forcequit)
    }
  }

  function onsignal() {
    process.once('SIGINT', forcequit)
    process.once('SIGTERM', forcequit)

    return onexit()
  }

  /**
   * Cause the process to forcefully shut down by throwing an uncaught exception
   *
   * @private
   * @return    {void}
   */
  function forcequit() {
    process.removeListener('SIGINT', forcequit)
    process.removeListener('SIGTERM', forcequit)

    if (respondsTo(delegate, 'didReceiveForcequit')) {
      delegate.didReceiveForcequit()
    }

    throw new Error('Forced quit')
  }

  process.once('SIGINT', onsignal)
  process.once('SIGTERM', onsignal)
  process.once('beforeExit', onexit)

  return Promise
    .resolve(delegate.execute())
    .catch(fatal)
}


/**
 * Handle a fatal error in the delegate during start or stop sequence
 *
 * @private
 * @param     {Error}    err    The error object which caused the fatal error
 * @return    {void}
 */
function fatal(err) {
  process.exitCode = 1
  // eslint-disable-next-line no-console
  console.error(err.stack)

  // A fatal error occured. We have no guarantee that the instance will shut down properly. We will
  // wait 10 seconds to see if it manages to shut down gracefully, then we will use brute force to
  // stop the process. 💣
  // eslint-disable-next-line no-process-exit
  setTimeout(() => process.exit(), 10000)
    .unref()
}

/**
 * Check if a given this context has a function fn defined on itself
 *
 * @private
 * @param     {Delegate}  delegate  Delegate to check
 * @param     {string}    fn        Function name to check
 * @return    {boolean}
 */
function respondsTo(delegate, fn) {
  return typeof delegate[fn] === 'function'
}

export {
  heimdall,
}
