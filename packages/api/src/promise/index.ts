// Copyright 2017-2020 @polkadot/api authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import ApiPromise, { decorateMethod } from '@polkadot/api/promise';
import { ApiOptions } from '@polkadot/api/types';
import initOptions from '@darwinia/api-options';

export default class DarwiniaApiPromise extends ApiPromise {
  constructor (options?: ApiOptions) {
    super({ ...initOptions, ...options });
  }
}

export { decorateMethod };
