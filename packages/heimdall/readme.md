# @strv/heimdall

[![Build Status][travis-badge]][travis-url]
![Built with GNU Make][make-badge]

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
    // Start whatever you need to start in this process.
    await app.start(process.env.PORT)
  },

  /**
   * This method will be invoked by Heimdall when the process receives a `SIGINT` or `SIGTERM`
   * signal. This method is also invoked when Node.js' event loop will empty and Node determines
   * that it can safely exit itself.
   * @return    {Promise}
   */
  async exit() {
    // Stop your servers, close down your open sockets or other activities that might be
    // keeping the Node process running.
    await app.stop()
  },

  /**
   * This method will be invoked by Heimdall when the process receives a second `SIGINT` or
   * `SIGTERM` signal (ie. the user pressing ctrl+c twice). You can log something to the console or
   * perform synchronous cleanup, but the Node process will be terminated shortly and any async I/O
   * operations are not guaranteed to complete in time.
   * @return    {void}
   */
  didReceiveForcequit() {
    // This is a synchronous method call. Running async I/O operations is not guaranteed to work.
  },
})
```

## License

See the [LICENSE](LICENSE) file for information.

[strv-home]: https://www.strv.com
[travis-badge]: https://img.shields.io/travis/com/strvcom/heimdall.svg?style=flat-square
[travis-url]: https://travis-ci.com/strvcom/heimdall
[make-badge]: https://img.shields.io/badge/Built%20with-GNU%20Make-brightgreen.svg?style=flat-square
