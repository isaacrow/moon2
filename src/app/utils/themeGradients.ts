/**
 * Theme-Aware Gradient System
 * Provides consistent gradients across all components based on the current Moon Engine theme
 */

export type MoonEngineTheme = 'glass' | 'neon' | 'classic' | 'clean' | 'blur';

export interface ThemeGradients {
  // Primary header gradients
  headerPrimary: string;
  headerSecondary: string;
  
  // Background gradients
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  
  // Card gradients
  cardPrimary: string;
  cardSecondary: string;
  cardAccent: string;
  
  // Button gradients
  btnPrimary: string;
  btnSecondary: string;
  btnSuccess: string;
  btnDanger: string;
  
  // Badge gradients
  badgePrimary: string;
  badgeSecondary: string;
  
  // Specific UI elements
  dialogHeader: string;
  quickActions: string;
  statusBar: string;
  
  // Text gradient classes (for bg-clip-text)
  textGradient: string;
}

export const themeGradients: Record<MoonEngineTheme, ThemeGradients> = {
  glass: {
    // Soft, elegant blue/purple/white iOS-inspired gradients
    headerPrimary: 'bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500',
    headerSecondary: 'bg-gradient-to-r from-purple-400 to-blue-400',
    
    bgPrimary: 'bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80 dark:from-blue-950/30 dark:via-gray-900 dark:to-purple-950/30',
    bgSecondary: 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20',
    bgTertiary: 'bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10',
    
    cardPrimary: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20',
    cardSecondary: 'bg-gradient-to-r from-white/80 to-blue-50/80 dark:from-gray-800/80 dark:to-blue-900/20',
    cardAccent: 'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10',
    
    btnPrimary: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
    btnSecondary: 'bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700',
    btnSuccess: 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600',
    btnDanger: 'bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600',
    
    badgePrimary: 'bg-gradient-to-r from-blue-500 to-purple-500',
    badgeSecondary: 'bg-gradient-to-r from-purple-400 to-pink-400',
    
    dialogHeader: 'bg-gradient-to-r from-blue-500 to-purple-500',
    quickActions: 'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10',
    statusBar: 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20',
    
    textGradient: 'from-blue-600 via-purple-600 to-pink-600',
  },
  
  neon: {
    // Cyberpunk electric cyan/magenta/electric gradients
    headerPrimary: 'bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500',
    headerSecondary: 'bg-gradient-to-r from-pink-500 to-cyan-500',
    
    bgPrimary: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    bgSecondary: 'bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10',
    bgTertiary: 'bg-gradient-to-br from-cyan-500/5 to-pink-500/5',
    
    cardPrimary: 'bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20',
    cardSecondary: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
    cardAccent: 'bg-gradient-to-br from-cyan-400/30 via-fuchsia-400/30 to-yellow-400/30',
    
    btnPrimary: 'bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 hover:from-cyan-600 hover:via-fuchsia-600 hover:to-pink-600',
    btnSecondary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    btnSuccess: 'bg-gradient-to-r from-green-400 to-cyan-500 hover:from-green-500 hover:to-cyan-600',
    btnDanger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
    
    badgePrimary: 'bg-gradient-to-r from-cyan-500 to-fuchsia-500',
    badgeSecondary: 'bg-gradient-to-r from-fuchsia-500 to-pink-500',
    
    dialogHeader: 'bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500',
    quickActions: 'bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/20 to-pink-500/20',
    statusBar: 'bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10',
    
    textGradient: 'from-cyan-400 via-fuchsia-400 to-pink-400',
  },
  
  classic: {
    // Traditional library burgundy/gold/brown gradients
    headerPrimary: 'bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-700',
    headerSecondary: 'bg-gradient-to-r from-yellow-700 to-amber-700',
    
    bgPrimary: 'bg-gradient-to-br from-amber-50 via-stone-50 to-yellow-50 dark:from-amber-950/20 dark:via-stone-950 dark:to-yellow-950/20',
    bgSecondary: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20',
    bgTertiary: 'bg-gradient-to-b from-amber-50 to-stone-100',
    
    cardPrimary: 'bg-gradient-to-br from-amber-50 to-stone-100 dark:from-amber-950/20 dark:to-stone-950/20',
    cardSecondary: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20',
    cardAccent: 'bg-gradient-to-br from-amber-200/30 via-yellow-200/30 to-orange-200/30',
    
    btnPrimary: 'bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-800 hover:to-yellow-800',
    btnSecondary: 'bg-gradient-to-r from-stone-600 to-amber-600 hover:from-stone-700 hover:to-amber-700',
    btnSuccess: 'bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800',
    btnDanger: 'bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-800 hover:to-orange-800',
    
    badgePrimary: 'bg-gradient-to-r from-amber-600 to-yellow-600',
    badgeSecondary: 'bg-gradient-to-r from-orange-600 to-amber-600',
    
    dialogHeader: 'bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-700',
    quickActions: 'bg-gradient-to-br from-amber-200/30 via-yellow-200/30 to-orange-200/30',
    statusBar: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20',
    
    textGradient: 'from-amber-700 via-yellow-600 to-orange-700',
  },
  
  clean: {
    // Minimal black/gray/white clean gradients
    headerPrimary: 'bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900',
    headerSecondary: 'bg-gradient-to-r from-gray-800 to-gray-700',
    
    bgPrimary: 'bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
    bgSecondary: 'bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800',
    bgTertiary: 'bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50',
    
    cardPrimary: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800',
    cardSecondary: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
    cardAccent: 'bg-gradient-to-br from-gray-100/50 via-gray-200/50 to-gray-100/50 dark:from-gray-800/50 dark:via-gray-700/50 dark:to-gray-800/50',
    
    btnPrimary: 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black',
    btnSecondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800',
    btnSuccess: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900',
    btnDanger: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900',
    
    badgePrimary: 'bg-gradient-to-r from-gray-700 to-gray-900',
    badgeSecondary: 'bg-gradient-to-r from-gray-600 to-gray-700',
    
    dialogHeader: 'bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900',
    quickActions: 'bg-gradient-to-br from-gray-100/50 via-gray-200/50 to-gray-100/50 dark:from-gray-800/50 dark:via-gray-700/50 dark:to-gray-800/50',
    statusBar: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
    
    textGradient: 'from-gray-800 via-gray-900 to-black dark:from-gray-200 dark:via-gray-300 dark:to-gray-400',
  },
  
  blur: {
    // iOS Visual Blur - Black glossy blurred glass inspired by expo-ios-visual-blur
    // Features directional blur gradients and glossy translucent effects
    headerPrimary: 'bg-gradient-to-b from-black/95 via-black/80 to-black/40',
    headerSecondary: 'bg-gradient-to-t from-black/95 via-black/70 to-transparent',
    
    // Blurred bottom to clear top (BlurredBottomClearTop direction)
    bgPrimary: 'bg-gradient-to-t from-black/90 via-black/50 to-transparent dark:from-black via-black/60 dark:to-black/20',
    bgSecondary: 'bg-gradient-to-b from-transparent via-black/30 to-black/70 dark:from-black/10 dark:via-black/40 dark:to-black/80',
    bgTertiary: 'bg-gradient-to-br from-black/20 via-transparent to-black/30 dark:from-black/30 dark:via-black/10 dark:to-black/40',
    
    // Glossy black cards with blur
    cardPrimary: 'bg-gradient-to-br from-black/70 via-black/50 to-black/80 dark:from-black/80 dark:via-black/60 dark:to-black/90',
    cardSecondary: 'bg-gradient-to-t from-black/80 via-black/50 to-black/20 dark:from-black/90 dark:via-black/70 dark:to-black/40',
    cardAccent: 'bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 dark:from-black/90 dark:via-gray-900/80 dark:to-black/95',
    
    // Glossy black buttons with gradient blur
    btnPrimary: 'bg-gradient-to-r from-black/90 via-gray-900/90 to-black/90 hover:from-black hover:via-gray-900 hover:to-black',
    btnSecondary: 'bg-gradient-to-b from-gray-800/80 via-gray-900/80 to-black/80 hover:from-gray-800/90 hover:via-gray-900/90 hover:to-black/90',
    btnSuccess: 'bg-gradient-to-r from-emerald-900/70 via-black/70 to-emerald-900/70 hover:from-emerald-900/80 hover:via-black/80 hover:to-emerald-900/80',
    btnDanger: 'bg-gradient-to-r from-red-900/70 via-black/70 to-red-900/70 hover:from-red-900/80 hover:via-black/80 hover:to-red-900/80',
    
    // Blurred badges
    badgePrimary: 'bg-gradient-to-r from-black/80 via-gray-900/80 to-black/80',
    badgeSecondary: 'bg-gradient-to-r from-gray-800/70 via-black/70 to-gray-800/70',
    
    // Directional blur for dialogs (clear top, blurred bottom)
    dialogHeader: 'bg-gradient-to-b from-black/95 via-black/85 to-black/60',
    quickActions: 'bg-gradient-to-t from-black/70 via-black/40 to-transparent dark:from-black/80 dark:via-black/50 dark:to-black/20',
    statusBar: 'bg-gradient-to-r from-black/60 via-black/40 to-black/60 dark:from-black/80 dark:via-black/60 dark:to-black/80',
    
    // Light text on dark blur
    textGradient: 'from-white via-gray-200 to-gray-300 dark:from-white dark:via-gray-100 dark:to-gray-200',
  },
};

/**
 * Get gradients for the current theme
 */
export function getThemeGradients(theme: MoonEngineTheme = 'glass'): ThemeGradients {
  return themeGradients[theme] || themeGradients.glass;
}

/**
 * Get a specific gradient type for the current theme
 */
export function getGradient(
  theme: MoonEngineTheme,
  type: keyof ThemeGradients
): string {
  return themeGradients[theme]?.[type] || themeGradients.glass[type];
}
