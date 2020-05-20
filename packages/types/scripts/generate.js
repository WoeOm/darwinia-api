/* eslint-disable sort-keys */
const interfaceRegistry = require('@polkadot/typegen/generate/interfaceRegistry');
const tsDef = require('@polkadot/typegen/generate/tsDef');
const defaultDefinations = require('@polkadot/types/interfaces/definitions');

const darwiniaDefinations = require('../src/interfaces/definitions');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { runtime, ...substrateDefinations } = defaultDefinations;

// eslint-disable-next-line @typescript-eslint/no-unused-vars

const definations = {
  '@polkadot/types/interfaces': defaultDefinations,
  '@darwinia/types/interfaces': darwiniaDefinations
};

module.exports = {
  default: function () {
    tsDef.generateTsDef(definations, 'packages/types/src/interfaces', '@darwinia/types/interfaces');
    interfaceRegistry.generateInterfaceTypes(definations, 'packages/types/src/interfaceRegistry.ts');
  }
};
