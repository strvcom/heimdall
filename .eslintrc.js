'use strict'

module.exports = {
  extends: [
    '@strv/node/v10',
    '@strv/node/optional',
    '@strv/node/style',
    '@strv/mocha',
  ],

  rules: {
    // If your editor cannot show these to you, occasionally turn this off and run the linter
    'no-warning-comments': 0,
  },
}
