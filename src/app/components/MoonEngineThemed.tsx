/**
 * Moon Engine Themed - Theme Switcher Wrapper
 * Allows switching between Glass and Neon themes
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { MoonEngineGlassWithOpac } from './MoonEngineGlassWithOpac';
import { MoonEngineNeon } from './MoonEngineNeon';
import { MoonEngineClassic } from './MoonEngineClassic';
import { MoonEngineClassicClean } from './MoonEngineClassicClean';
import { MoonEngineBlur } from './MoonEngineBlur';
import { Palette, Languages } from 'lucide-react';

interface MoonEngineThemedProps {
  onBack?: () => void;
}

type Theme = 'glass' | 'neon' | 'classic' | 'clean' | 'blur';

export function MoonEngineThemed({ onBack }: MoonEngineThemedProps) {
  const { t, i18n } = useTranslation();
  const { moonEngineTheme, setMoonEngineTheme } = useTheme();
  const [theme, setTheme] = useState<Theme>(moonEngineTheme);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  useEffect(() => {
    console.log('🌙 MoonEngineThemed rendered with theme:', theme);
  }, [theme]);

  // Sync with global theme context
  useEffect(() => {
    setMoonEngineTheme(theme);
  }, [theme, setMoonEngineTheme]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const getButtonClass = () => {
    if (theme === 'glass') return 'glass-button text-gray-700 hover:scale-105';
    if (theme === 'neon') return 'neon-button';
    if (theme === 'classic') return 'classic-button';
    if (theme === 'blur') return 'ios-blur-button';
    return 'clean-button';
  };

  const getCardClass = () => {
    if (theme === 'glass') return 'glass-card';
    if (theme === 'neon') return 'neon-card';
    if (theme === 'classic') return 'classic-card';
    if (theme === 'blur') return 'ios-blur-card';
    return 'clean-card';
  };

  return (
    <div className="relative h-screen">
      {/* Floating Theme Selector */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className={`px-4 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 flex items-center gap-2 ${getButtonClass()}`}
          title={i18n.language === 'en' ? t('switchToArabic') : t('switchToEnglish')}
        >
          <Languages className="h-4 w-4" />
          {i18n.language === 'en' ? 'ع' : 'EN'}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setShowThemeSelector(!showThemeSelector)}
          className={`px-4 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 flex items-center gap-2 ${getButtonClass()}`}
        >
          <Palette className="h-4 w-4" />
          {t('themeSelector')}
        </button>

        {/* Theme Options Dropdown */}
        {showThemeSelector && (
          <div className={`rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${getCardClass()}`}>
            <button
              onClick={() => {
                setTheme('glass');
                setShowThemeSelector(false);
              }}
              className={`w-full px-4 py-3 text-left transition-all duration-300 flex items-center gap-3 ${theme === 'glass' ? 'glass-tab-active font-semibold' : 'hover:bg-white/10'}`}
            >
              <div className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center">
                ✨
              </div>
              <div>
                <div className="font-medium">{t('glassTheme')}</div>
                <div className="text-xs opacity-70">iOS Visual Blur</div>
              </div>
            </button>

            <button
              onClick={() => {
                setTheme('neon');
                setShowThemeSelector(false);
              }}
              className={`w-full px-4 py-3 text-left transition-all duration-300 flex items-center gap-3 ${theme === 'neon' ? 'neon-tab-active font-semibold' : 'hover:bg-white/10'}`}
            >
              <div className="w-8 h-8 rounded-lg neon-panel flex items-center justify-center">
                ⚡
              </div>
              <div>
                <div className="font-medium">{t('neonTheme')}</div>
                <div className="text-xs opacity-70">Cyberpunk 2077</div>
              </div>
            </button>

            <button
              onClick={() => {
                setTheme('classic');
                setShowThemeSelector(false);
              }}
              className={`w-full px-4 py-3 text-left transition-all duration-300 flex items-center gap-3 ${theme === 'classic' ? 'classic-tab-active font-semibold' : 'hover:bg-white/10'}`}
            >
              <div className="w-8 h-8 rounded-lg classic-panel flex items-center justify-center text-sm">
                CL
              </div>
              <div>
                <div className="font-medium">{t('classicTheme')}</div>
                <div className="text-xs opacity-70">Traditional Library</div>
              </div>
            </button>

            <button
              onClick={() => {
                setTheme('clean');
                setShowThemeSelector(false);
              }}
              className={`w-full px-4 py-3 text-left transition-all duration-300 flex items-center gap-3 ${theme === 'clean' ? 'clean-tab-active font-semibold' : 'hover:bg-white/10'}`}
            >
              <div className="w-8 h-8 rounded-lg clean-panel flex items-center justify-center text-sm">
                MN
              </div>
              <div>
                <div className="font-medium">Classic Clean</div>
                <div className="text-xs opacity-70">Minimal White</div>
              </div>
            </button>

            <button
              onClick={() => {
                setTheme('blur');
                setShowThemeSelector(false);
              }}
              className={`w-full px-4 py-3 text-left transition-all duration-300 flex items-center gap-3 ${theme === 'blur' ? 'ios-blur-button font-semibold' : 'hover:bg-white/10'}`}
            >
              <div className="w-8 h-8 rounded-lg ios-glossy-black-medium flex items-center justify-center text-sm">
                BL
              </div>
              <div>
                <div className="font-medium">iOS Visual Blur</div>
                <div className="text-xs opacity-70">Black Glossy Glass</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Render Selected Theme */}
      {theme === 'glass' && <MoonEngineGlassWithOpac onBack={onBack} />}
      {theme === 'neon' && <MoonEngineNeon onBack={onBack} />}
      {theme === 'classic' && <MoonEngineClassic onBack={onBack} />}
      {theme === 'clean' && <MoonEngineClassicClean onBack={onBack} />}
      {theme === 'blur' && <MoonEngineBlur onBack={onBack} />}
    </div>
  );
}