import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'shopsphere.guestToken';

interface GuestState {
  guestToken: string | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setGuestToken: (token: string) => Promise<void>;
}

/**
 * The guest identifier travels as the `X-Guest-Token` request header (see
 * apps/api's guestToken middleware doc comment for why — native apps don't
 * keep cookies across restarts the way a browser does). Not sensitive data
 * (never derived from a customer identity), so plain AsyncStorage is fine —
 * only the refresh token needs Keychain/Keystore-backed storage.
 */
export const useGuestStore = create<GuestState>((set) => ({
  guestToken: null,
  isHydrated: false,

  hydrate: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      set({ guestToken: stored, isHydrated: true });
      return;
    }
    const generated = uuidv4();
    await AsyncStorage.setItem(STORAGE_KEY, generated);
    set({ guestToken: generated, isHydrated: true });
  },

  setGuestToken: async (token) => {
    set({ guestToken: token });
    await AsyncStorage.setItem(STORAGE_KEY, token);
  }
}));
