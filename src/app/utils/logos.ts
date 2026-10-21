import logoBlack from '@/assets/black.png';
import logoWhite from '@/assets/white.png';

export { logoBlack, logoWhite };

export function getMoonLogo(isDark: boolean = false): string {
  return isDark ? logoWhite : logoBlack;
}

