import React from 'react';
import { useThemeSafe } from '../hooks/useThemeSafe';
import { logoBlack, logoWhite } from '../utils/logos';

export interface MoonLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  variant?: 'auto' | 'black' | 'white';
  glow?: boolean;
}

export function MoonLogo({
  variant = 'auto',
  glow = false,
  className = '',
  style,
  alt = 'Moon Logo',
  ...props
}: MoonLogoProps) {
  const { darkMode } = useThemeSafe();

  const isDark = variant === 'auto' ? darkMode : variant === 'white';
  const logoSrc = isDark ? logoWhite : logoBlack;

  if (glow && isDark) {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-40 animate-pulse" />
        <img
          src={logoSrc}
          alt={alt}
          className="relative w-full h-full object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
          style={style}
          {...props}
        />
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`object-contain ${className}`}
      style={style}
      {...props}
    />
  );
}

export default MoonLogo;
