'use strict'

module.exports = {
  // eslint-disable-next-line no-template-curly-in-string
  tagFormat: '${version}',
  branches: [
    // TODO: Ideally the default release branch would be release/latest
    // but semantic-release refuses to work with a default branch with a slash, apparently 🤷‍♂️
    { name: 'release' },
    { name: 'release/next', channel: 'next', prerelease: 'beta' },
  ],

  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    ['@semantic-release/npm', {
      npmPublish: true,
      tarballDir: '.',
    }],
    '@semantic-release/git',
    ['@semantic-release/github', {
      assets: [{ path: '*.tgz', label: '@strv/heimdall.tgz' }],
    }],
  ],
}
