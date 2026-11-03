import { createApiClient } from '@shopsphere/api-client';
import { apiBaseUrl } from '@/config/appConfig';
import { useAuthStore } from '@/stores/authStore';
import { useGuestStore } from '@/stores/guestStore';

/**
 * One shared client for the whole app. It reads the current access token and
 * guest token from their stores at call time (never captured once at
 * creation, since both rotate) and never holds a credential of its own —
 * see @shopsphere/api-client's own doc comment. `onUnauthorized` clears the
 * session so the UI falls back to signed-out state rather than looping on
 * an invalid token; `onResponseHeaders` persists a server-issued guest token
 * if ours was missing/rejected.
 */
export const api = createApiClient({
  baseUrl: apiBaseUrl,
  getAccessToken: () => useAuthStore.getState().accessToken,
  getExtraHeaders: () => {
    const guestToken = useGuestStore.getState().guestToken;
    return guestToken ? { 'X-Guest-Token': guestToken } : undefined;
  },
  onResponseHeaders: (headers) => {
    const issued = headers.get('x-guest-token');
    if (issued && issued !== useGuestStore.getState().guestToken) {
      void useGuestStore.getState().setGuestToken(issued);
    }
  },
  onUnauthorized: () => {
    void useAuthStore.getState().clearSession();
  }
});
