/**
 * Safe Theme Hook - Provides fallback for theme context
 * Use this instead of useTheme() directly to avoid Provider errors during HMR
 */

import { useTheme } from '../contexts/ThemeContext';
import type { MoonEngineTheme } from '../utils/themeGradients';

export interface SafeThemeContext {
  themeStyle: 'ios26' | 'macos' | 'apple-store' | 'classic';
  setThemeStyle: (style: 'ios26' | 'macos' | 'apple-store' | 'classic') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  moonEngineTheme: MoonEngineTheme;
  setMoonEngineTheme: (theme: MoonEngineTheme) => void;
}

/**
 * Safely access theme context with fallback defaults
 */
export function useThemeSafe(): SafeThemeContext {
  try {
    return useTheme();
  } catch (error) {
    // Fallback when ThemeProvider is not available (e.g., during HMR)
    console.warn('ThemeProvider not available, using defaults');
    return {
      themeStyle: 'ios26',
      setThemeStyle: () => {},
      darkMode: false,
      setDarkMode: () => {},
      moonEngineTheme: 'glass',
      setMoonEngineTheme: () => {},
    };
  }
}
