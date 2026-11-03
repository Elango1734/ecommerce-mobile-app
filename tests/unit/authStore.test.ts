import * as Keychain from 'react-native-keychain';

jest.mock('@/api/client', () => ({
  api: { auth: { refresh: jest.fn() } }
}));

import { api } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

const REFRESH_TOKEN_SERVICE = 'shopsphere.refreshToken';

async function getStoredToken(): Promise<string | null> {
  const result = await Keychain.getGenericPassword({ service: REFRESH_TOKEN_SERVICE });
  return result ? result.password : null;
}

async function setStoredToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('shopsphere', token, { service: REFRESH_TOKEN_SERVICE });
}

const sampleAuthResult = {
  accessToken: 'access-token-1',
  refreshToken: 'refresh-token-1',
  user: { id: 'u1', roles: ['customer'], status: 'active', emailVerified: true, phoneVerified: false, createdAt: new Date().toISOString() }
};

describe('useAuthStore', () => {
  afterEach(async () => {
    await useAuthStore.getState().clearSession();
    jest.clearAllMocks();
  });

  it('setSession stores the access token in memory and the refresh token in SecureStore', async () => {
    await useAuthStore.getState().setSession(sampleAuthResult as never);

    expect(useAuthStore.getState().accessToken).toBe('access-token-1');
    expect(useAuthStore.getState().user?.id).toBe('u1');
    await expect(getStoredToken()).resolves.toBe('refresh-token-1');
  });

  it('clearSession removes both the in-memory token and the persisted refresh token', async () => {
    await useAuthStore.getState().setSession(sampleAuthResult as never);
    await useAuthStore.getState().clearSession();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    await expect(getStoredToken()).resolves.toBeNull();
  });

  it('hydrate() restores a session from a stored refresh token by calling refresh', async () => {
    await setStoredToken('stored-refresh-token');
    (api.auth.refresh as jest.Mock).mockResolvedValueOnce(sampleAuthResult);

    await useAuthStore.getState().hydrate();

    expect(api.auth.refresh).toHaveBeenCalledWith('stored-refresh-token');
    expect(useAuthStore.getState().accessToken).toBe('access-token-1');
    expect(useAuthStore.getState().isHydrated).toBe(true);
  });

  it('hydrate() clears a stale refresh token when refresh fails (e.g. reuse-detection revocation)', async () => {
    await setStoredToken('stale-refresh-token');
    (api.auth.refresh as jest.Mock).mockRejectedValueOnce(new Error('invalid'));

    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().accessToken).toBeNull();
    await expect(getStoredToken()).resolves.toBeNull();
  });

  it('hydrate() with no stored token leaves the session signed out', async () => {
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isHydrated).toBe(true);
    expect(api.auth.refresh).not.toHaveBeenCalled();
  });
});
