'use strict'

module.exports = {
  compact: false,
  comments: false,
  sourceMaps: 'inline',
  plugins: [
    '@babel/syntax-object-rest-spread',
    ['@babel/transform-modules-commonjs', {
      allowTopLevelThis: false,
      noInterop: true,
    }],
    '@babel/proposal-class-properties',
  ],
  ignore: [
    '**/node_modules',
  ],
}
