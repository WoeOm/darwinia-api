/* eslint-disable @typescript-eslint/no-empty-interface */
// Copyright 2017-2020 @polkadot/api-derive authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId, AccountIndex, RegistrationJudgement, LockIdentifier, Balance } from '@polkadot/types/interfaces';
import { Compact, Enum, HashMap, Option, Result, Struct, U8aFixed, Vec } from '@polkadot/types/codec';
import { BlockNumber, Digest, Hash, Index } from '@polkadot/types/interfaces/runtime';
import { Bytes, Text, bool, u32, u64, u8 } from '@polkadot/types/primitive';

import { AccountData, Reasons } from '@darwinia/types/interfaces';

/** @name RefCount */
export interface RefCount extends u8 {}

/** @name AccountInfo */
export interface AccountInfo extends Struct {
  readonly nonce: Index;
  readonly refcount: RefCount;
  readonly data: AccountData;
}

/** @name DerivedBalanceLock */
export type DerivedBalanceLock = {
  id: LockIdentifier;
  amount: Balance;
  until: BlockNumber;
  reasons: Reasons;
}
