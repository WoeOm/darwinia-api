// Copyright 2017-2020 @polkadot/api-derive authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId, AccountIndex, Address, Balance, BalanceLockTo212, BlockNumber, VestingInfo, VestingSchedule } from '@polkadot/types/interfaces';
import { BalanceLock } from '@darwinia/types';
import { DeriveBalancesAccount, DeriveBalancesAll } from '../types';
import { DerivedBalanceLock } from './types';

import BN from 'bn.js';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiInterfaceRx } from '@polkadot/api/types';
import { Option, Vec } from '@polkadot/types';
import { bnMax } from '@polkadot/util';

import { memo } from '../util';

type ResultBalance = [BalanceLock, BalanceLock[]];
type Result = [DeriveBalancesAccount, BlockNumber, ResultBalance];

function calcLocks (api: ApiInterfaceRx, locks: (BalanceLock)[], bestNumber: BlockNumber): [Balance, (DerivedBalanceLock)[]] {
  let lockedBn = new BN(0);
  let lockedBalance = api.registry.createType('Balance');
  let lockedBreakdown: (DerivedBalanceLock)[] = [];
  lockedBn = locks.reduce((total, { id, lock_for, reasons }) => {
    if (lock_for.isStaking) {
      total = total.add(lock_for.asStaking?.staking_amount);
      const _lockedBreakdown = lock_for.asStaking?.unbondings.filter(({ moment }): boolean => !moment || (bestNumber && moment.gt(bestNumber)));
      lockedBreakdown = lockedBreakdown.concat(_lockedBreakdown.map(({ amount, moment }): DerivedBalanceLock => ({
        id: id,
        amount,
        until: moment,
        reasons: reasons
      })));
      _lockedBreakdown.forEach(({ amount }) => {total = total.add(amount)});
    }
    return total;
  }, new BN(0));
  lockedBalance = api.registry.createType('Balance', lockedBn);
  return [lockedBalance, lockedBreakdown];
}

function calcBalances (api: ApiInterfaceRx, [{ accountId, accountNonce, freeBalance, freeBalanceKton, frozenFee, frozenMisc, reservedBalance, reservedBalanceKton, votingBalance, votingBalanceKton }, bestNumber, [vesting, locks]]: Result): DeriveBalancesAll {
  let lockedBalance = api.registry.createType('Balance');
  let lockedBalanceKton = api.registry.createType('Balance');

  let lockedBreakdown: DerivedBalanceLock[] = [];
  let lockedBreakdownKton: DerivedBalanceLock[] = [];

  let allLocked = false;

  if (Array.isArray(locks)) {
    // only get the locks that are valid until passed the current block
    lockedBreakdown = (locks as BalanceLockTo212[]).filter(({ until }): boolean => !until || (bestNumber && until.gt(bestNumber)));

    const notAll = lockedBreakdown.filter(({ amount }): boolean => !amount.isMax());

    allLocked = lockedBreakdown.some(({ amount }): boolean => amount.isMax());

    // get the maximum of the locks according to https://github.com/paritytech/substrate/blob/master/srml/balances/src/lib.rs#L699
    if (notAll.length) {
      lockedBalance = api.registry.createType('Balance', bnMax(...notAll.map(({ amount }): Balance => amount)));
    }
  }

  // Calculate the vesting balances,
  //  - offset = balance locked at startingBlock
  //  - perBlock is the unlock amount
  const { locked: vestingTotal, perBlock, startingBlock } = vesting || api.registry.createType('VestingInfo');
  const isStarted = bestNumber.gt(startingBlock);
  const vestedBalance = api.registry.createType('Balance', isStarted ? perBlock.mul(bestNumber.sub(startingBlock)) : 0);
  const isVesting = isStarted && vestedBalance.lt(vestingTotal);

  // The available balance & vested has an interplay here
  // "
  // vesting is a guarantee that the account's balance will never go below a certain amount. so it functions in the opposite way, a bit like a lock that is monotonically decreasing rather than a liquid amount that is monotonically increasing.
  // locks function as the same guarantee - that a balance will not be lower than a particular amount.
  // because of this you can see that if there is a "vesting lock" that guarantees the balance cannot go below 200, and a "staking lock" that guarantees the balance cannot drop below 300, then we just have two guarantees of which the first is irrelevant.
  // i.e. (balance >= 200 && balance >= 300) == (balance >= 300)
  // ""
  const floating = freeBalance.sub(lockedBalance);
  const extraReceived = isVesting ? freeBalance.sub(vestingTotal) : new BN(0);
  const availableBalance = api.registry.createType('Balance', allLocked ? 0 : bnMax(new BN(0), isVesting && floating.gt(vestedBalance) ? vestedBalance.add(extraReceived) : floating));

  return {
    accountId,
    accountNonce,
    availableBalance,
    freeBalance,
    frozenFee,
    frozenMisc,
    isVesting,
    lockedBalance,
    lockedBreakdown,
    reservedBalance,
    vestedBalance,
    vestingTotal,
    votingBalance
  };
}

// current (balances  vesting)
function queryCurrent (api: ApiInterfaceRx, accountId: AccountId): Observable<ResultBalance> {
  return (
    api.queryMulti([
      [api.query.balances.locks, accountId],
      [api.query.kton.locks, accountId]
    ])
  ).pipe(
    map(([locks, locks]): ResultBalance =>
      [locks, locks]
    )
  );
}

/**
 * @name all
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
export function all (api: ApiInterfaceRx): (address: AccountIndex | AccountId | Address | string) => Observable<DeriveBalancesAll> {
  return memo((address: AccountIndex | AccountId | Address | string): Observable<DeriveBalancesAll> =>
    api.derive.balances.account(address).pipe(
      switchMap((account): Observable<Result> =>
        (!account.accountId.isEmpty
          ? combineLatest([
            of(account),
            api.derive.chain.bestNumber(),
            queryCurrent(api, account.accountId)
          ])
          : of([account, api.registry.createType('BlockNumber'), [null, api.registry.createType('Vec<BalanceLock>')]])
        )
      ),
      map((result): DeriveBalancesAll => calcBalances(api, result))
    ));
}
