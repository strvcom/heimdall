# @strv/heimdall

[![Build Status][ci-badge]][ci-url]

> The process lifecycle gatekeeper.
>
> Built with ❤️ at [STRV][strv-home]

Heimdall takes control over the Node.js process' signal handling and provides a simple way to respond to various process lifecycle events.

## Installation

```sh
npm i --save @strv/heimdall
```

## Usage

```js
import { heimdall } from '@strv/heimdall'
// Import something important. Maybe a Koa server? Or Atlas.js instance?
import { app } from './app'

heimdall({
  /**
   * The execute method is invoked by Heimdall immediately after calling `heimdall()`. You can
   * start your servers and set up any other important tasks here.
   * @return    {Promise}
   */
  async execute() {
    // Start whatever you need to start in this process. Whatever you return from this function, you
    // will receive it in the .exit() method below.
    return await app.start(process.env.PORT)
  },

  /**
   * This method will be invoked by Heimdall when the process receives a `SIGINT` or `SIGTERM`
   * signal. This method is also invoked when Node.js' event loop will empty and Node determines
   * that it can safely exit itself.
   * @return    {Promise}
   */
  async exit({ runtime }) {
    // Stop your servers, close down your open sockets or other activities that might be
    // keeping the Node process running.
    await app.stop()

    // runtime is exactly what you returned in .execute(), in this case it is the Koa instance
    app === runtime
  },

  /**
   * This optional method will be invoked by Heimdall when the process receives a second `SIGINT` or
   * `SIGTERM` signal (ie. the user pressing ctrl+c twice). You can log something to the console or
   * perform synchronous cleanup, but the Node process will be terminated shortly and any async I/O
   * operations are not guaranteed to complete in time.
   * @return    {void}
   */
  didReceiveForcequit() {
    // This is a synchronous method call. Running async I/O operations is not guaranteed to work.
  },

  /**
   * This optional method will be used by Heimdall when one of the Delegate's methods throws an
   * error. Heimdall logs these errors to the stderr output stream but if you implement this method,
   * it will let you log the error using your logging solution of choice.
   *
   * The log should be synchronous as the process will be terminated in the next event loop.
   */
  logError(err) {
    pino.error({ err }, 'heimdall received error')
  }
})
```

## License

See the [LICENSE](LICENSE) file for information.

[strv-home]: https://www.strv.com
[ci-badge]: https://github.com/strvcom/heimdall/workflows/Continuous%20Integration/badge.svg
[ci-url]: https://travis-ci.com/strvcom/heimdall
