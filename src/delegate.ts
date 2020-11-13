/**
 * A Delegate implements methods necessary to respond to process lifecycle events
 */
interface Delegate<Runtime> {
  /**
   * Set this to true to let Heimdall call the exit handler as soon as the execute handler finishes
   *
   * This is ideal for one-off scripts, commands or other utilities where you want to do a task and
   * then let the process exit gracefully.
   */
  exitAfterExecute?: boolean

  /**
   * Invoked immediately when heimdall receives the delegate
   *
   * You can start your servers, set up event listeners or perform other async initialisation work
   * here.
   */
  execute(): Promise<Runtime>

  /**
   * Invoked when the process is about to exit due to received signal or empty event loop
   *
   * You should stop all your servers, remove event listeners or close any open connections here.
   * In the ideal scenario, Node.js will simply exit on its own due to no more work to be done
   * once you clean everything up.
   */
  exit(params: { runtime: Runtime }): Promise<void>

  /**
   * Invoked when the process received a terminating signal more than once
   *
   * When a user presses ctrl+c more than once or when a process manager sends a terminating
   * signal more than once, this method is called the second time this happens to notify you about
   * it.
   *
   * ⚠️ The process will exit when the current event loop is done - any async I/O you initiate in
   * this function will NOT be completed.
   */
  didReceiveForcequit?(): void

  /**
   * Log the given error instance to a console or other log destination
   *
   * If you have a custom logging solution or if you would like to customise how a potential error
   * is printed to the console, you can implement this method and Heimdall will defer all error
   * logging to it, instead of logging using the built-in `console.error()` method.
   */
  logError?(error: Error): void
}

export {
  Delegate,
}
