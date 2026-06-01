import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider } from 'react-native-paper';
import {
  Palette,
  lightPalette,
  darkPalette,
  lightTheme,
  darkTheme,
} from './index';

type Scheme = 'light' | 'dark';

interface ThemeContextValue {
  scheme: Scheme;
  palette: Palette;
  isDark: boolean;
  toggle: () => void;
  setScheme: (scheme: Scheme) => void;
}

const STORAGE_KEY = '@swapskill/color-scheme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [scheme, setSchemeState] = useState<Scheme>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );
  const [ready, setReady] = useState(false);

  // Restore the user's saved preference on mount before rendering, so we don't
  // flash the system scheme and then flip to the stored one.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(saved => {
        if (saved === 'light' || saved === 'dark') setSchemeState(saved);
      })
      .finally(() => setReady(true));
  }, []);

  const setScheme = (next: Scheme) => {
    setSchemeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = scheme === 'dark';
    return {
      scheme,
      isDark,
      palette: isDark ? darkPalette : lightPalette,
      toggle: () => setScheme(isDark ? 'light' : 'dark'),
      setScheme,
    };
  }, [scheme]);

  // Avoid rendering the tree until the stored preference has been read.
  if (!ready) return null;

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={scheme === 'dark' ? darkTheme : lightTheme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within a ThemeProvider');
  return ctx;
}

/** Convenience hook for the active color palette. */
export function usePalette(): Palette {
  return useAppTheme().palette;
}
