'use strict'

module.exports = {
  colors: true,
  checkLeaks: true,
  require: [
    'source-map-support/register',
    'test/bootstrap',
  ],
  exclude: [
    'node_modules/**',
  ],
}
