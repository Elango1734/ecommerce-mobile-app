/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jestSetup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // The @shopsphere/* packages are authored with explicit `.js` extensions on relative imports pointing
    // at `.ts` source (the standard Node16/NodeNext ESM convention — see apps/api's jest config for the same
    // fix, and metro.config.js's resolver override for Metro's equivalent). Jest's resolver has no built-in
    // remapping for this, so without this rule any such import 404s under test.
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  // The default 'react-native' preset's transformIgnorePatterns already covers react-native,
  // @react-native/*, and the common ecosystem scopes (@react-navigation included) that ship
  // untranspiled ESM — no override needed now that the Expo-specific packages are gone.
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts']
};
