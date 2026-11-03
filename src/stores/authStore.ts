import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import type { AuthResult, UserDto } from '@shopsphere/api-client';
import { api } from '@/api/client';

const REFRESH_TOKEN_SERVICE = 'shopsphere.refreshToken';

/**
 * `react-native-keychain` stores a username+password pair, not a single
 * opaque string — there is no real "username" here, so a fixed placeholder
 * is used and only `password` (the refresh token) is ever read back.
 */
const REFRESH_TOKEN_USERNAME = 'shopsphere';

async function setRefreshToken(token: string): Promise<void> {
  await Keychain.setGenericPassword(REFRESH_TOKEN_USERNAME, token, { service: REFRESH_TOKEN_SERVICE });
}

async function getRefreshToken(): Promise<string | null> {
  const result = await Keychain.getGenericPassword({ service: REFRESH_TOKEN_SERVICE });
  return result ? result.password : null;
}

async function deleteRefreshToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE });
}

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  isHydrated: boolean;
  setSession: (result: AuthResult) => Promise<void>;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
}

/**
 * The refresh token is the only credential ever written to disk, and only
 * to iOS Keychain / Android Keystore via expo-secure-store — never
 * AsyncStorage (security.md). The access token lives in memory only
 * (Zustand state) and is re-minted from the refresh token on cold start via
 * `hydrate()`, consistent with "short-lived access tokens, rotating refresh
 * sessions."
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,

  setSession: async (result) => {
    set({ user: result.user, accessToken: result.accessToken });
    await setRefreshToken(result.refreshToken);
  },

  clearSession: async () => {
    set({ user: null, accessToken: null });
    await deleteRefreshToken().catch(() => undefined);
  },

  hydrate: async () => {
    const storedRefreshToken = await getRefreshToken().catch(() => null);
    if (!storedRefreshToken) {
      set({ isHydrated: true });
      return;
    }
    try {
      const result = await api.auth.refresh(storedRefreshToken);
      set({ user: result.user, accessToken: result.accessToken, isHydrated: true });
      await setRefreshToken(result.refreshToken);
    } catch {
      await deleteRefreshToken().catch(() => undefined);
      set({ user: null, accessToken: null, isHydrated: true });
    }
  }
}));

export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => Boolean(state.accessToken));
}

/** Only `useLogout` needs the raw refresh token (to revoke it server-side); it is never read into React state. */
export async function getStoredRefreshToken(): Promise<string | null> {
  return getRefreshToken().catch(() => null);
}
