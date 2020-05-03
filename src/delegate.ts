/**
 * A Delegate implements methods necessary to respond to process lifecycle events
 */
interface Delegate<Runtime> {
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
}

export {
  Delegate,
}