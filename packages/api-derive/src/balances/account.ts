// Copyright 2017-2020 @polkadot/api-derive authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId, AccountIndex, Address, Balance, Index } from '@polkadot/types/interfaces';
import { AccountData } from '@darwinia/types/interfaces';
import { AccountInfo } from './types';
import { ITuple } from '@polkadot/types/types';
import { DeriveBalancesAccount } from '../types';

import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiInterfaceRx } from '@polkadot/api/types';

import { memo } from '../util';

type Result = [Balance, Balance, Balance, Balance, Balance, Balance, Index];

function calcBalances (api: ApiInterfaceRx, [accountId, [freeBalance, freeBalanceKton, reservedBalance, reservedBalanceKton, frozenFee, frozenMisc, accountNonce]]: [AccountId, Result]): DeriveBalancesAccount {
  return {
    accountId,
    accountNonce,
    freeBalance,
    freeBalanceKton,
    frozenFee,
    frozenMisc,
    reservedBalance,
    reservedBalanceKton,
    votingBalance: api.registry.createType('Balance', freeBalance.add(reservedBalance)),
    votingBalanceKton: api.registry.createType('Balance', freeBalanceKton.add(reservedBalanceKton))
  };
}

function queryCurrent (api: ApiInterfaceRx, accountId: AccountId): Observable<Result> {
  // AccountInfo is current, support old, eg. Edgeware
  return api.query.system.account<AccountInfo | ITuple<[Index, AccountData]>>(accountId).pipe(
    map((infoOrTuple): Result => {
      const { feeFrozen, free, freeKton, miscFrozen, reserved, reservedKton } = (infoOrTuple as AccountInfo).nonce
        ? (infoOrTuple as AccountInfo).data
        : (infoOrTuple as [Index, AccountData])[1];
      const accountNonce = (infoOrTuple as AccountInfo).nonce || (infoOrTuple as [Index, AccountData])[0];

      return [free, freeKton, reserved, reservedKton, feeFrozen, miscFrozen, accountNonce];
    })
  );
}

/**
 * @name account
 * @param {( AccountIndex | AccountId | Address | string )} address - An accounts Id in different formats.
 * @returns An object containing the results of various balance queries
 * @example
 * <BR>
 *
 * ```javascript
 * const ALICE = 'F7Hs';
 *
 * api.derive.balances.all(ALICE, ({ accountId, lockedBalance }) => {
 *   console.log(`The account ${accountId} has a locked balance ${lockedBalance} units.`);
 * });
 * ```
 */
export function account (api: ApiInterfaceRx): (address: AccountIndex | AccountId | Address | string) => Observable<DeriveBalancesAccount> {
  return memo((address: AccountIndex | AccountId | Address | string): Observable<DeriveBalancesAccount> =>
    api.derive.accounts.info(address).pipe(
      switchMap(({ accountId }): Observable<[AccountId, Result]> =>
        (accountId
          ? combineLatest([
            of(accountId),
            queryCurrent(api, accountId)
          ])
          : of([api.registry.createType('AccountId'), [api.registry.createType('Balance'), api.registry.createType('Balance'), api.registry.createType('Balance'), api.registry.createType('Balance'), api.registry.createType('Balance'), api.registry.createType('Balance'), api.registry.createType('Index')]])
        )
      ),
      map((result): DeriveBalancesAccount => calcBalances(api, result))
    ));
}
