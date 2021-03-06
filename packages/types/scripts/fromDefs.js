#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/typegen authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-var-requires */

let main;

try {
  main = require('./generate').default;
} catch (error) {
  require('@babel/register')({
    extensions: ['.js', '.ts'],
    plugins: [
      ['module-resolver', {
        alias: {
          // '^@polkadot/metadata(.*)': './packages/metadata/src\\1',
          // eslint-disable-next-line sort-keys
          '^@polkadot/typegen(.*)': './packages/typegen/src\\1',
          // '^@polkadot/types-known(.*)': './packages/types-known/src\\1',
          // eslint-disable-next-line sort-keys
          '^@polkadot/types(.*)': './packages/polkadot-types/src\\1'
        }
      }]
    ]
  });

  main = require('./generate.js').default;
}

main();
