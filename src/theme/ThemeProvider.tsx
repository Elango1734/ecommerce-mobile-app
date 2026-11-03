import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme, palette, radii, spacing, typography, motion, type SemanticColorRoles, type ThemeName } from '@shopsphere/config';

export type ThemePreference = ThemeName | 'system';

interface ThemeContextValue {
  colors: SemanticColorRoles;
  resolvedScheme: ThemeName;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  motion: typeof motion;
  palette: typeof palette;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'shopsphere.theme-preference';

/**
 * Respects the OS color scheme by default ("system"), but lets the customer
 * override it (Settings screen) — product-requirements.md: "Light and dark
 * modes" plus "accessibility preferences". The choice persists locally; it
 * is a per-device UI preference, not account data, so it is never synced to
 * the backend.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') setPreferenceState(stored);
    });
  }, []);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    void AsyncStorage.setItem(STORAGE_KEY, pref);
  };

  const resolvedScheme: ThemeName = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: getTheme(resolvedScheme),
      resolvedScheme,
      preference,
      setPreference,
      typography,
      spacing,
      radii,
      motion,
      palette
    }),
    [resolvedScheme, preference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
