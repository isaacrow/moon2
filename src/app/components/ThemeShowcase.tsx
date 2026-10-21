import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Smartphone, 
  Monitor, 
  Layout, 
  Sparkles, 
  Palette,
  ChevronRight,
  Check,
  Star,
  Zap,
  Store
} from 'lucide-react';
import { toast } from 'sonner';

export function ThemeShowcase() {
  const { themeStyle, setThemeStyle } = useTheme();

  const handleThemeChange = (newTheme: typeof themeStyle) => {
    setThemeStyle(newTheme);
    
    const themeNames = {
      ios26: 'iOS 26',
      macos: 'macOS',
      'apple-store': 'Apple Store',
      classic: 'Classic'
    };
    
    toast.success(`✨ Switched to ${themeNames[newTheme]} Theme`, {
      duration: 2000,
      description: 'Theme applied across the entire application'
    });
  };

  const themes = [
    {
      id: 'ios26' as const,
      name: 'iOS 26',
      nameAr: 'نظام آيفون',
      icon: Smartphone,
      description: 'Modern, vibrant design inspired by the latest iOS with glassmorphism, dynamic gradients, and smooth animations.',
      descriptionAr: 'تصميم حديث ونابض بالحياة مستوحى من أحدث نظام iOS مع تأثيرات زجاجية وتدرجات ديناميكية وحركات سلسة.',
      features: [
        'Glassmorphism effects',
        'Vibrant gradient cards',
        'Bounce animations',
        'Rounded corners (20px)',
        'Dynamic shadows',
        'iOS-style transitions'
      ],
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      bgGradient: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30'
    },
    {
      id: 'macos' as const,
      name: 'macOS',
      nameAr: 'نظام ماك',
      icon: Monitor,
      description: 'Clean, spacious interface inspired by macOS with subtle blur effects, professional shadows, and elegant spacing.',
      descriptionAr: 'واجهة نظيفة وواسعة مستوحاة من نظام macOS مع تأثيرات طمس خفيفة وظلال احترافية ومساحات أنيقة.',
      features: [
        'Subtle backdrop blur',
        'Professional shadows',
        'Clean typography',
        'Spacious layouts',
        'Refined borders',
        'Smooth transitions'
      ],
      gradient: 'from-gray-400 to-gray-600',
      bgGradient: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'
    },
    {
      id: 'apple-store' as const,
      name: 'Apple Store',
      nameAr: 'متجر أبل',
      icon: Store,
      description: 'Official Apple.com design with hero sections, gradient backgrounds, clean product cards, and the signature blue CTAs.',
      descriptionAr: 'تصميم موقع Apple.com الرسمي مع أقسام بطولية وخلفيات متدرجة وبطاقات منتجات نظيفة وأزرار زرقاء مميزة.',
      features: [
        'Apple.com aesthetics',
        'Hero product sections',
        'Gradient backgrounds',
        'Blue signature CTAs',
        'Clean white cards',
        'Product showcase layout'
      ],
      gradient: 'from-blue-400 via-sky-300 to-blue-500',
      bgGradient: 'bg-gradient-to-br from-blue-50 via-sky-50 to-gray-100 dark:from-blue-950/20 dark:via-sky-950/20 dark:to-gray-900'
    },
    {
      id: 'classic' as const,
      name: 'Classic',
      nameAr: 'كلاسيك',
      icon: Layout,
      description: 'Traditional design with familiar UI patterns, standard spacing, and conventional styling for a comfortable experience.',
      descriptionAr: 'تصميم تقليدي مع أنماط واجهة مألوفة ومسافات قياسية وأنماط تقليدية لتجربة مريحة.',
      features: [
        'Traditional styling',
        'Standard components',
        'Familiar patterns',
        'Consistent spacing',
        'Simple transitions',
        'Universal compatibility'
      ],
      gradient: 'from-blue-500 to-blue-700',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Apple-Inspired Design System
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Moon Theme Selector
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose your preferred design language. Switch between iOS 26, macOS, and Classic themes instantly.
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-500 max-w-2xl mx-auto" dir="rtl">
            اختر لغة التصميم المفضلة لديك. التبديل بين سمات iOS 26 وmacOS والكلاسيكية على الفور.
          </p>
        </div>

        {/* Current Theme Badge */}
        <div className="flex justify-center">
          <Badge className="px-6 py-3 text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <Star className="h-4 w-4 mr-2" />
            Currently using: {themes.find(t => t.id === themeStyle)?.name}
          </Badge>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map((theme, index) => {
            const Icon = theme.icon;
            const isActive = themeStyle === theme.id;
            
            return (
              <Card 
                key={theme.id}
                className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer animate-in fade-in slide-in-from-bottom-4 ${
                  isActive 
                    ? 'ring-4 ring-purple-500 dark:ring-purple-400 shadow-2xl scale-105' 
                    : 'hover:ring-2 hover:ring-purple-300'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleThemeChange(theme.id)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 ${theme.bgGradient} opacity-50`} />
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg">
                      <Check className="h-3 w-3" />
                      Active
                    </div>
                  </div>
                )}

                <CardHeader className="relative z-10 space-y-4">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Title */}
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {theme.name}
                    </CardTitle>
                    <p className="text-lg font-medium text-muted-foreground" dir="rtl">
                      {theme.nameAr}
                    </p>
                  </div>

                  {/* Description */}
                  <CardDescription className="text-sm leading-relaxed">
                    {theme.description}
                  </CardDescription>
                  <CardDescription className="text-sm leading-relaxed" dir="rtl">
                    {theme.descriptionAr}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  {/* Features List */}
                  <div className="space-y-2">
                    {theme.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-3 w-3 text-purple-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button 
                    className={`w-full ${isActive ? 'bg-green-600 hover:bg-green-700' : `bg-gradient-to-r ${theme.gradient}`} text-white shadow-lg`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeChange(theme.id);
                    }}
                  >
                    {isActive ? (
                      <>
                        <Check className="h-4 w-4" />
                        Currently Active
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Switch to {theme.name}
                      </>
                    )}
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Live Preview Section */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Live Preview
            </CardTitle>
            <CardDescription>
              See how components look in the current theme
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6">
            {/* Sample Buttons */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            {/* Sample Cards */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Card</CardTitle>
                    <CardDescription>This is how cards look</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Card content with theme-aware styling
                    </p>
                  </CardContent>
                </Card>
                <Card className={themeStyle === 'ios26' ? 'ios-card' : themeStyle === 'macos' ? 'macos-card' : ''}>
                  <CardHeader>
                    <CardTitle>Glass Effect</CardTitle>
                    <CardDescription>With backdrop blur</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Glassmorphism styling
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  <CardHeader>
                    <CardTitle>Gradient Card</CardTitle>
                    <CardDescription className="text-white/80">Featured style</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/90">
                      Vibrant gradient background
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sample Badges */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">Gradient</Badge>
              </div>
            </div>

            {/* Theme-Specific Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Theme-Specific Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {themeStyle === 'ios26' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5" />
                      <span className="font-semibold">Glassmorphism</span>
                    </div>
                    <p className="text-sm text-white/90">
                      Frosted glass effect with backdrop blur
                    </p>
                  </div>
                )}
                {themeStyle === 'macos' && (
                  <div className="p-4 rounded-lg bg-gray-200 dark:bg-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="h-5 w-5" />
                      <span className="font-semibold">Clean Design</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Professional macOS-style interface
                    </p>
                  </div>
                )}
                {themeStyle === 'apple-store' && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 via-sky-50 to-white dark:from-blue-950/20 dark:via-sky-950/20 dark:to-gray-900">
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900 dark:text-white">Apple Store</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Official Apple.com product showcase design
                    </p>
                  </div>
                )}
                {themeStyle === 'classic' && (
                  <div className="p-4 rounded border-2 border-blue-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Layout className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Traditional</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Familiar UI patterns you know
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Animation Demo */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Animations</h3>
              <div className="flex gap-3">
                <div className={`px-4 py-2 rounded-lg bg-blue-600 text-white ${
                  themeStyle === 'ios26' ? 'bounce-in' : 
                  themeStyle === 'macos' ? 'slide-in' : 
                  themeStyle === 'apple-store' ? 'animate-fade-in' : 
                  ''
                }`}>
                  {themeStyle === 'ios26' ? 'Bounce Effect' : 
                   themeStyle === 'macos' ? 'Slide Effect' : 
                   themeStyle === 'apple-store' ? 'Fade Effect' :
                   'Standard'}
                </div>
                <div className="px-4 py-2 rounded-lg bg-purple-600 text-white loading">
                  Loading State
                </div>
              </div>
            </div>

            {/* Apple Store Theme Special Showcase */}
            {themeStyle === 'apple-store' && (
              <div className="space-y-3 p-6 bg-gradient-to-br from-blue-50 via-sky-50 to-white dark:from-blue-950/20 dark:via-sky-950/20 dark:to-gray-900 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Store className="h-5 w-5 text-blue-600" />
                  Apple Store Theme Preview
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Experience the official Apple.com design with clean product showcases and signature blue CTAs
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button className="apple-cta">
                    Buy
                  </Button>
                  <Button className="apple-button-secondary">
                    Learn more
                  </Button>
                  <Badge className="apple-badge">NEW</Badge>
                </div>
                <div className="apple-product bg-white dark:bg-gray-800 !p-4 !rounded-xl">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="apple-heading !text-xl !mb-2">iPhone 16</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">From $799</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center space-y-2 pb-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The theme you select will be applied across the entire Moon application
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500" dir="rtl">
            سيتم تطبيق السمة التي تختارها على تطبيق Moon بالكامل
          </p>
        </div>
      </div>
    </div>
  );
}
