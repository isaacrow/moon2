import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LayoutDashboard, FilePlus, User, LogOut, Languages, ChevronLeft, BookOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ThemeSwitcher } from './ThemeSwitcher';
import moonLogo from 'figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png';
import '../../styles/moon-space-theme.css';

interface TopNavBarProps {
  onDashboard: () => void;
  onNewRecord: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  /** Show a back button instead of dashboard button */
  showBack?: boolean;
  onBack?: () => void;
}

export function TopNavBar({ 
  onDashboard, 
  onNewRecord, 
  darkMode: _externalDarkMode, 
  onToggleDarkMode: _externalToggle,
  showBack,
  onBack,
}: TopNavBarProps) {
  const { t, i18n } = useTranslation();
  const { username, logout } = useAuth();
  const { darkMode } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const getUserInitials = () => {
    if (!username) return 'U';
    return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserColor = () => {
    if (!username) return '#6366f1';
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f59e0b','#10b981','#06b6d4','#3b82f6'];
    return colors[Math.abs(hash) % colors.length];
  };

  const isDark = darkMode;

  return (
    <div
      className="sticky top-3 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-300"
    >
      <div
        className="liquid-glass-dock w-full justify-between px-5 py-2.5 rounded-full"
        style={{
          background: isDark
            ? 'rgba(15, 23, 42, 0.72)'
            : 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(24px) saturate(170%)',
          WebkitBackdropFilter: 'blur(24px) saturate(170%)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.14)'
            : '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: isDark
            ? '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)'
            : '0 16px 40px rgba(15, 23, 42, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-3">
          {showBack && onBack ? (
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-glass-btn p-2 rounded-full mr-1 cursor-pointer"
              title="الرجوع للخلف"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
          ) : null}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onDashboard}>
            <div className="relative">
              <img
                src={moonLogo}
                alt="Moon Logo"
                className="relative h-8 w-auto drop-shadow-sm"
                style={isDark ? { filter: 'brightness(0) invert(1) drop-shadow(0 0 6px rgba(255,255,255,0.4))' } : {}}
              />
            </div>
            <div className="flex flex-col">
              <span
                className="text-sm font-black tracking-tight"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                Moon Studio
              </span>
              <span
                className="text-[9px] font-bold uppercase tracking-[0.14em]"
                style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b' }}
              >
                BIBFRAME 3.0.1
              </span>
            </div>
          </div>
        </div>

        {/* Center: Quick Actions & Public OPAC link */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onDashboard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="liquid-glass-btn text-xs font-bold gap-1.5 cursor-pointer py-1.5 px-3.5"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-slate-600" />
            <span className="hidden sm:inline">{t('dashboard')}</span>
          </motion.button>

          {/* Direct Link to Standalone OPAC */}
          <motion.a
            href="/opac.html"
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="liquid-glass-pill py-1.5 px-3.5 text-xs font-bold cursor-pointer"
            title="فتح بوابة الفهرس العام (WOF MOON OPAC)"
          >
            <svg className="h-3.5 w-3.5 text-blue-600 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="hidden md:inline">OPAC Catalog</span>
          </motion.a>

                    {/* Direct Link to Web View (3D Spatial OPAC) */}
          <motion.button
            type="button"
            onClick={onSpatialOpac || (() => { window.location.href = './?view=moon-spatial-opac'; })}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="liquid-glass-pill py-1.5 px-3 text-xs font-bold cursor-pointer flex items-center gap-1.5 border-purple-400/40 text-purple-900 bg-purple-500/10"
            title="الانتقال إلى واجهة الويب وفهرس المقتنيات ثلاثية الأبعاد (Web View)"
          >
            <span>🪐</span>
            <span className="hidden md:inline font-extrabold">الويب 3D OPAC</span>
          </motion.button>

          {/* Direct Link to Manuscripts MARC 21 */}
          <motion.button
            type="button"
            onClick={onManuscripts || (() => { window.location.href = './?view=moon-manuscripts'; })}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="liquid-glass-pill py-1.5 px-3 text-xs font-bold cursor-pointer flex items-center gap-1.5 border-emerald-400/40 text-emerald-900 bg-emerald-500/10"
            title="فهرس ومقارنة المخطوطات MARC 21 & RDA (D:\MAN)"
          >
            <span>📜</span>
            <span className="hidden md:inline font-extrabold">المخطوطات MARC</span>
          </motion.button>

          <motion.button
            onClick={onNewRecord}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="liquid-glass-primary text-xs font-bold gap-1.5 cursor-pointer py-1.5 px-4"
          >
            <FilePlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('newRecord')}</span>
          </motion.button>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <ThemeSwitcher showLabels={false} />

          {/* Language Toggle */}
          <motion.button
            onClick={toggleLanguage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all"
            style={{
              background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
              color: isDark ? 'rgba(255,255,255,0.70)' : '#6b7280',
            }}
            title={i18n.language === 'en' ? t('switchToArabic') : t('switchToEnglish')}
          >
            <Languages className="h-4 w-4" />
            <span className="text-xs font-bold">
              {i18n.language === 'en' ? 'ع' : 'EN'}
            </span>
          </motion.button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <Avatar className="h-7 w-7 shadow-md" style={{ border: `2px solid ${getUserColor()}40` }}>
                  <AvatarImage src="" alt={username || 'User'} />
                  <AvatarFallback
                    className="text-white font-bold text-xs"
                    style={{ backgroundColor: getUserColor() }}
                  >
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                  >
                    {username || 'User'}
                  </span>
                  <span
                    className="text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#9ca3af' }}
                  >
                    Cataloger
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
              style={{
                background: isDark ? 'rgba(10,10,20,0.95)' : 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(20px)',
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.10)',
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.8)' : '0 10px 40px rgba(0,0,0,0.15)',
              }}
            >
              <DropdownMenuLabel style={{ color: isDark ? '#ffffff' : '#111827' }}>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold">{username || 'User'}</p>
                  <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.40)' : '#9ca3af' }}>
                    {username ? `${username}@moon.local` : 'cataloger@moon.local'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
              <DropdownMenuItem
                style={{ color: isDark ? 'rgba(255,255,255,0.80)' : '#374151' }}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>{t('profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer"
                style={{ color: '#f87171' }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
