import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Moon, Sun, Layers, Check, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type AppThemeMode = 'moon-dark' | 'moon-light' | 'classic';

interface ThemeOption {
  id: AppThemeMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  preview: {
    bg: string;
    card: string;
    text: string;
    accent: string;
  };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'moon-dark',
    label: 'Moon Dark',
    description: 'Deep space • Glassmorphism • Gradient accents',
    icon: <Moon className="h-4 w-4" />,
    preview: {
      bg: 'linear-gradient(135deg, #000000 0%, #0a0520 50%, #000510 100%)',
      card: 'rgba(255,255,255,0.08)',
      text: '#ffffff',
      accent: 'linear-gradient(90deg, #3b82f6, #a855f7, #ec4899)',
    },
  },
  {
    id: 'moon-light',
    label: 'Moon Light',
    description: 'Frosted glass • Soft gradients • Clean',
    icon: <Sun className="h-4 w-4" />,
    preview: {
      bg: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 50%, #e8f5e9 100%)',
      card: 'rgba(255,255,255,0.75)',
      text: '#1e293b',
      accent: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
    },
  },
  {
    id: 'classic',
    label: 'Classic',
    description: 'Plain white • No effects • Maximum clarity',
    icon: <Layers className="h-4 w-4" />,
    preview: {
      bg: '#f8fafc',
      card: '#ffffff',
      text: '#111827',
      accent: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
    },
  },
];

interface ThemeSwitcherProps {
  /** When true, shows as a floating button in bottom-right */
  floating?: boolean;
  /** Extra CSS class name */
  className?: string;
  /** Show labels next to icons */
  showLabels?: boolean;
}

export function ThemeSwitcher({ floating = false, className = '', showLabels = false }: ThemeSwitcherProps) {
  const { themeStyle, setThemeStyle, darkMode, setDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive the current app theme mode from ThemeContext
  const getCurrentMode = (): AppThemeMode => {
    if (darkMode) return 'moon-dark';
    if (themeStyle === 'classic') return 'classic';
    return 'moon-light';
  };

  const currentMode = getCurrentMode();

  const applyTheme = (mode: AppThemeMode) => {
    if (mode === 'moon-dark') {
      setDarkMode(true);
      setThemeStyle('ios26');
    } else if (mode === 'moon-light') {
      setDarkMode(false);
      setThemeStyle('ios26');
    } else {
      setDarkMode(false);
      setThemeStyle('classic');
    }
    setIsOpen(false);
  };

  // Robust outside click detection using the top-level container ref
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const currentOption = THEME_OPTIONS.find(o => o.id === currentMode) || THEME_OPTIONS[0];

  const triggerBtn = (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-xl
        bg-black/40 backdrop-blur-xl
        border border-white/15
        text-white/80 hover:text-white
        hover:bg-white/10 hover:border-white/25
        transition-all duration-200
        shadow-lg cursor-pointer select-none
        ${className}
      `}
      title="Switch Theme"
    >
      <Palette className="h-4 w-4" />
      {showLabels && (
        <span className="text-xs font-semibold uppercase tracking-wider">
          {currentOption.label}
        </span>
      )}
    </motion.button>
  );

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: floating ? 10 : -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: floating ? 10 : -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className={`
            absolute z-[99999] w-72
            ${floating ? 'bottom-full mb-3 right-0' : 'top-full mt-2 right-0'}
          `}
        >
          <div className="theme-switcher-panel p-3 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-1 mb-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Select Theme
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Theme Options */}
            <div className="space-y-1.5">
              {THEME_OPTIONS.map((option) => {
                const isActive = option.id === currentMode;
                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => applyTheme(option.id)}
                    className={`
                      w-full flex items-center gap-3 p-2.5 rounded-xl
                      transition-all duration-150 text-left cursor-pointer
                      ${isActive
                        ? 'theme-option-active shadow-md'
                        : 'theme-option-inactive hover:bg-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    {/* Preview swatch */}
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-white/15 shadow-md"
                      style={{ background: option.preview.bg }}
                    >
                      <div className="w-full h-full flex flex-col gap-1 p-1">
                        <div
                          className="rounded-sm h-2.5 w-full opacity-90"
                          style={{ background: option.preview.card }}
                        />
                        <div
                          className="rounded-sm h-1 w-3/4"
                          style={{ background: option.preview.accent, opacity: 0.8 }}
                        />
                        <div
                          className="rounded-sm h-1 w-1/2"
                          style={{ background: option.preview.text, opacity: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs font-bold flex items-center gap-1.5">
                          {option.icon}
                          {option.label}
                        </span>
                        {isActive && (
                          <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-white/40 text-[10px] mt-0.5 truncate">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-2.5 pt-2 border-t border-white/10">
              <p className="text-white/30 text-[10px] text-center uppercase tracking-widest font-mono">
                Saved automatically
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={containerRef} className={`relative inline-block ${floating ? 'fixed bottom-6 right-6 z-50' : ''}`}>
      {triggerBtn}
      {panel}
    </div>
  );
}
