// Native modules with no JS-only implementation need a manual mock under test.
jest.mock('react-native-keychain', () => {
  const store = new Map<string, { username: string; password: string }>();
  return {
    setGenericPassword: jest.fn(async (username: string, password: string, options: { service: string }) => {
      store.set(options.service, { username, password });
      return true;
    }),
    getGenericPassword: jest.fn(async (options: { service: string }) => store.get(options.service) ?? false),
    resetGenericPassword: jest.fn(async (options: { service: string }) => {
      store.delete(options.service);
      return true;
    })
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
