import React, { createContext, useContext, useState, useEffect } from 'react';
import type { MoonEngineTheme } from '../utils/themeGradients';

export type ThemeStyle = 'ios26' | 'macos' | 'apple-store' | 'classic';

interface ThemeContextType {
  themeStyle: ThemeStyle;
  setThemeStyle: (style: ThemeStyle) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  moonEngineTheme: MoonEngineTheme;
  setMoonEngineTheme: (theme: MoonEngineTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>(() => {
    const saved = localStorage.getItem('moon-theme-style');
    return (saved as ThemeStyle) || 'ios26';
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('moon-dark-mode');
    return saved === 'true';
  });

  const [moonEngineTheme, setMoonEngineTheme] = useState<MoonEngineTheme>(() => {
    const saved = localStorage.getItem('moon-engine-theme');
    return (saved as MoonEngineTheme) || 'glass';
  });

  useEffect(() => {
    localStorage.setItem('moon-theme-style', themeStyle);
    
    // Add transition class for smooth theme switching
    document.documentElement.classList.add('theme-transition');
    
    // Apply theme class to document
    document.documentElement.classList.remove('theme-ios26', 'theme-macos', 'theme-apple-store', 'theme-classic');
    document.documentElement.classList.add(`theme-${themeStyle}`);
    
    // Remove transition class after theme change completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  }, [themeStyle]);

  useEffect(() => {
    localStorage.setItem('moon-dark-mode', String(darkMode));
    
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('moon-engine-theme', moonEngineTheme);
  }, [moonEngineTheme]);

  return (
    <ThemeContext.Provider value={{ themeStyle, setThemeStyle, darkMode, setDarkMode, moonEngineTheme, setMoonEngineTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
