// Copyright 2017-2020 @polkadot/api-derive authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise, WsProvider } from '@polkadot/api';

import { TypeRegistry, Option } from '@polkadot/types';

import * as definitions from '@darwinia/types/definitions';
import type { StakingLedgerT } from '@darwinia/types';

// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe('approvalFlagsToBools', (): void => {
  it('warns on invalid types', async (): Promise<void> => {
    // expect.assertions(1);
    const registry = new TypeRegistry();
    const types = Object.values(definitions).reduce((res, { types }): object => ({ ...res, ...types }), {});
    const provider = new WsProvider('wss://crab.darwinia.network');

    const api = await ApiPromise.create({
      provider,
      types: {
        ...types
        // aliasses that don't do well as part of interfaces
        // chain-specific overrides
      }
    });

    // get a query
    const ledgerOpt: Option<StakingLedgerT> = await api.query.staking.ledger('5HE1gjo5cRP5Xzf42zrc3gExws6zqrtnMsHTi3jZ5KbLpKnd');

    // the types match with what we expect here
    const ledger: StakingLedgerT | null = ledgerOpt.unwrapOr(null);

    console.log(ledger && ledger.toHuman());

    // expect(true).toEqual(true);
  });
});
