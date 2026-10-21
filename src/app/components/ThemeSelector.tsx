import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator 
} from './ui/dropdown-menu';
import { Paintbrush, Smartphone, Monitor, Layout, Store } from 'lucide-react';
import { toast } from 'sonner';

export function ThemeSelector() {
  const { themeStyle, setThemeStyle } = useTheme();

  const handleThemeChange = (newTheme: typeof themeStyle) => {
    setThemeStyle(newTheme);
    
    // Show toast notification
    const themeNames = {
      ios26: 'iOS 26',
      macos: 'macOS',
      'apple-store': 'Apple Store',
      classic: 'Classic'
    };
    
    const themeNamesAr = {
      ios26: 'آيفون',
      macos: 'ماك',
      'apple-store': 'متجر أبل',
      classic: 'كلاسيك'
    };
    
    toast.success(
      `Theme changed to ${themeNames[newTheme]} / تم تغيير السمة إلى ${themeNamesAr[newTheme]}`,
      {
        duration: 2000,
        description: newTheme === 'ios26' 
          ? 'Modern iOS design with glassmorphism' 
          : newTheme === 'macos'
          ? 'Clean macOS professional interface'
          : newTheme === 'apple-store'
          ? 'Official Apple.com product showcase design'
          : 'Traditional familiar design'
      }
    );
  };

  const themes = [
    {
      id: 'ios26' as const,
      name: 'iOS 26',
      nameAr: 'نظام آيفون',
      icon: Smartphone,
      description: 'Modern iOS Design',
      descriptionAr: 'تصميم آيفون الحديث'
    },
    {
      id: 'macos' as const,
      name: 'macOS',
      nameAr: 'نظام ماك',
      icon: Monitor,
      description: 'macOS Interface',
      descriptionAr: 'واجهة ماك'
    },
    {
      id: 'apple-store' as const,
      name: 'Apple Store',
      nameAr: 'متجر أبل',
      icon: Store,
      description: 'Product Showcase',
      descriptionAr: 'عرض المنتجات'
    },
    {
      id: 'classic' as const,
      name: 'Classic',
      nameAr: 'كلاسيك',
      icon: Layout,
      description: 'Traditional Design',
      descriptionAr: 'تصميم تقليدي'
    }
  ];

  const currentTheme = themes.find(t => t.id === themeStyle);
  const Icon = currentTheme?.icon || Paintbrush;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full relative group"
          title="Theme Style / نمط التصميم"
        >
          <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400 transition-transform group-hover:scale-110" />
          {/* Subtle pulse ring to draw attention */}
          <span className="absolute inset-0 rounded-full bg-purple-400 dark:bg-purple-600 opacity-0 group-hover:opacity-20 transition-opacity" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Paintbrush className="h-4 w-4" />
          <span>Theme Style / نمط التصميم</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((theme) => {
          const ThemeIcon = theme.icon;
          const isActive = themeStyle === theme.id;
          return (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`cursor-pointer ${
                isActive 
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' 
                  : ''
              }`}
            >
              <ThemeIcon className={`mr-2 h-4 w-4 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
              <div className="flex flex-col flex-1">
                <span className="font-medium">{theme.name} / {theme.nameAr}</span>
                <span className="text-xs text-muted-foreground">
                  {theme.description} / {theme.descriptionAr}
                </span>
              </div>
              {isActive && (
                <div className="ml-2 h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400"></div>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
