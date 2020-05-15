// Copyright 2017-2020 @polkadot/api-derive authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise, WsProvider } from '@polkadot/api';

import { TypeRegistry, Option } from '@polkadot/types';

import * as definitions from '@darwinia/types/interfaces/definitions';
import jsonrpc from '@darwinia/types/interfaces/jsonrpc';

import type { StakingLedgerT } from '@darwinia/types/interfaces';

import * as balances from '@polkadot/api-derive/balances';
import { UnsubscribePromise } from '@polkadot/api/types';

let api: ApiPromise;

beforeAll(async () => {
  console.log('beforeAll');
  const registry = new TypeRegistry();
  const types = Object.values(definitions).reduce((res, { types }): object => ({ ...res, ...types }), {});
  const provider = new WsProvider('wss://crab.darwinia.network');

  api = await ApiPromise.create({
    provider,
    rpc: {
      ...jsonrpc
    },
    types: {
      ...types
      // aliasses that don't do well as part of interfaces
      // chain-specific overrides
    }
  });

  // const hash = await api.rpc.chain.getBlockHash(77934);
  // const block = await api.rpc.chain.getBlock(hash);

  // console.log(block);

  // // get a query
  // const ledgerOpt: Option<StakingLedgerT> = await api.query.staking.ledger('5HE1gjo5cRP5Xzf42zrc3gExws6zqrtnMsHTi3jZ5KbLpKnd');

  // // the types match with what we expect here
  // const ledger: StakingLedgerT | null = ledgerOpt.unwrapOr(null);

  // console.log(ledger && ledger.toHuman());
});

afterAll(() => {
  console.log('afterAll');
  api && api.disconnect();
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe('Balances Module', (): void => {
  it('fees', (done): void => {
    api.derive.balances.fees(({ creationFee,
      existentialDeposit,
      transactionBaseFee,
      transactionByteFee,
      transferFee }) => {
      console.log(creationFee,
        existentialDeposit.toString(),
        transactionBaseFee,
        transactionByteFee.toString(),
        transferFee);
      expect(existentialDeposit.toString()).not.toEqual('0');
      expect(transactionByteFee.toString()).not.toEqual('0');
      done();
    });
  });

  it('all', (done): void => {
    api.derive.balances.all('5HE1gjo5cRP5Xzf42zrc3gExws6zqrtnMsHTi3jZ5KbLpKnd', ({ accountId,
      accountNonce,
      availableBalance,
      availableBalanceKton,
      freeBalance,
      freeBalanceKton,
      frozenFee,
      frozenMisc,
      isVesting,
      lockedBalance,
      lockedBalanceKton,
      lockedBreakdown,
      lockedBreakdownKton,
      reservedBalance,
      reservedBalanceKton,
      vestedBalance,
      vestingTotal,
      votingBalance,
      votingBalanceKton }) => {
      // balanceAll.toHuman()
      const result = { accountId,
        accountNonce,
        availableBalance,
        availableBalanceKton,
        freeBalance,
        freeBalanceKton,
        frozenFee,
        frozenMisc,
        isVesting,
        lockedBalance,
        lockedBalanceKton,
        lockedBreakdown,
        lockedBreakdownKton,
        reservedBalance,
        reservedBalanceKton,
        vestedBalance,
        vestingTotal,
        votingBalance,
        votingBalanceKton };

      console.log(JSON.stringify(result, null, 2));
      // expect(existentialDeposit.toString()).not.toEqual('0');
      // expect(transactionByteFee.toString()).not.toEqual('0');
      done();
    });
  });
});
