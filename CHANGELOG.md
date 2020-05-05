# [2.0.0-alpha.2](https://github.com/strvcom/heimdall/compare/2.0.0-alpha.1...2.0.0-alpha.2) (2020-05-05)


### Features

* allow Delegate to log errors by implementing .logError() ([c6403f7](https://github.com/strvcom/heimdall/commit/c6403f7c956e7a95638628af0ffeb256ee8332b2))

# [2.0.0-alpha.1](https://github.com/strvcom/heimdall/compare/1.1.3...2.0.0-alpha.1) (2020-05-05)


### Features

* add commitlint Github Action ([66349e4](https://github.com/strvcom/heimdall/commit/66349e4aec59f28136b0aeaf1a7ebce6d534cf82))
* drop Node.js 10 support ([ca2f8ad](https://github.com/strvcom/heimdall/commit/ca2f8ad2a4b107a06624542c10de7b6c23b550e3))
* mark Node.js 14 as officially supported ([faca8aa](https://github.com/strvcom/heimdall/commit/faca8aa177130c08b0dfe73b27d63d5ee72a957c))
* rewrite to TypeScript ([6c59432](https://github.com/strvcom/heimdall/commit/6c5943240afdc3c19a1ed8eaf778f148ed163a7c))


### BREAKING CHANGES

* Node.js v10 is no longer supported.
* Heimdall will no longer wait 10 seconds after a second signal has been received before it forcibly kills the process. Instead, it will kill the process immediatelly in the next event loop.
* Node.js 11 is no longer officially supported although it is unlikely that Heimdall will not work on this release.

## [1.1.3](https://github.com/strvcom/heimdall/compare/1.1.2...1.1.3) (2019-12-02)


### Bug Fixes

* ensure compiled JS is included in the release 🤦‍♂️ ([246bfca](https://github.com/strvcom/heimdall/commit/246bfca8cd70c421d30ce77f975eb2e2c9e14fa9))

## [1.1.2](https://github.com/strvcom/heimdall/compare/1.1.1...1.1.2) (2019-11-07)


### Bug Fixes

* avoid running dev-only npm scripts when installing this package ([e846dfc](https://github.com/strvcom/heimdall/commit/e846dfc81e8065fe232d92e5ac26a8b994911da8))

## [1.1.1](https://github.com/strvcom/heimdall/compare/1.1.0...1.1.1) (2019-11-01)


### Bug Fixes

* publish the npm tarball to Github Assets ([dfb7ec2](https://github.com/strvcom/heimdall/commit/dfb7ec22703546b6542ae587196f71edcdb81429))

# [1.1.0](https://github.com/strvcom/heimdall/compare/1.0.2...1.1.0) (2019-11-01)


### Features

* remove Lerna, use Github Actions 🚀 ([cfa9895](https://github.com/strvcom/heimdall/commit/cfa9895a95ddac9e90f6c5e6ba9ae5631b75357c))

## [1.0.2](https://github.com/strvcom/heimdall/compare/@strv/heimdall@1.0.1...@strv/heimdall@1.0.2) (2019-08-28)


### Bug Fixes

* add TypeScript typings 🎉 ([21f01b0](https://github.com/strvcom/heimdall/commit/21f01b0))
* do not call delegate.exit() more than once ([ba6ae58](https://github.com/strvcom/heimdall/commit/ba6ae58))





## [1.0.1](https://github.com/strvcom/heimdall/compare/@strv/heimdall@1.0.0...@strv/heimdall@1.0.1) (2019-06-12)


### Bug Fixes

* update Travis-CI badges ([178b7e4](https://github.com/strvcom/heimdall/commit/178b7e4))





# 1.0.0 (2019-04-26)

**Note:** Version bump only for package @strv/heimdall
