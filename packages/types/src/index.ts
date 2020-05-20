import { RegistryTypes } from '@polkadot/types/types';

import * as definations from './interfaces/definitions';

export * as InterfaceRegistry from './interfaceRegistry';

export { definations };

export const types: RegistryTypes = Object.values(definations).map(({ types }) => types).reduce((all, types) => Object.assign(all, types), {});
