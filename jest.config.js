// Copyright 2017-2020 @polkadot/api authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const config = require('@polkadot/dev/config/jest');

module.exports = Object.assign({}, config, {
  moduleNameMapper: {
    '@darwinia/api-derive(.*)$': '<rootDir>/packages/api-derive/src/$1',
    '@darwinia/api-options(.*)$': '<rootDir>/packages/api-options/src/$1',
    // eslint-disable-next-line sort-keys
    '@darwinia/api(.*)$': '<rootDir>/packages/api/src/$1',
    '@darwinia/types(.*)$': '<rootDir>/packages/interfaces/src/$1'
  },
  modulePathIgnorePatterns: [
    '<rootDir>/packages/api-derive/build',
    '<rootDir>/packages/interfaces/build'
  ],
  resolver: './jest.resolver.js',
  testTimeout: 100000
});
