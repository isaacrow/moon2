import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  HelpCircle, 
  Book, 
  Users, 
  MessageSquare, 
  FileText, 
  ExternalLink,
  Lightbulb,
  Bug,
  Sparkles,
  Globe,
  Mail,
  Video
} from 'lucide-react';

interface SinopiaResourcesProps {
  onBack?: () => void;
}

export function SinopiaResources({ onBack }: SinopiaResourcesProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const helpResources = [
    {
      title: isRTL ? 'موقع المساعدة' : 'Help Site',
      description: isRTL ? 'دليل المستخدم الشامل والوثائق' : 'Comprehensive user guide and documentation',
      icon: HelpCircle,
      color: 'blue',
      link: '#'
    },
    {
      title: isRTL ? 'الإبلاغ عن خطأ' : 'Report a Bug',
      description: isRTL ? 'أخبرنا عن أي مشاكل تواجهها' : 'Let us know about any issues you encounter',
      icon: Bug,
      color: 'red',
      link: '#'
    },
    {
      title: isRTL ? 'اقترح ميزة جديدة' : 'Suggest a Feature',
      description: isRTL ? 'شارك أفكارك للتحسينات' : 'Share your ideas for improvements',
      icon: Lightbulb,
      color: 'yellow',
      link: '#'
    },
    {
      title: isRTL ? 'ملاحظات الإصدار' : 'Release Notes',
      description: isRTL ? 'اطلع على آخر التحديثات والميزات' : 'See the latest updates and features',
      icon: FileText,
      color: 'green',
      link: '#'
    },
  ];

  const communication = [
    {
      title: isRTL ? 'اجتماعات مجموعة المستخدمين' : 'User Group Meetings',
      description: isRTL ? 'انضم إلى اجتماعاتنا الشهرية' : 'Join our monthly meetings',
      icon: Users,
      color: 'purple',
      link: '#'
    },
    {
      title: isRTL ? 'القائمة البريدية' : 'Mailing List',
      description: isRTL ? 'اشترك في قائمة مجموعة المستخدمين البريدية' : 'Subscribe to the user group mailing list',
      icon: Mail,
      color: 'blue',
      link: '#'
    },
    {
      title: isRTL ? 'قناة Slack' : 'Slack Channel',
      description: '#moon-cataloging',
      icon: MessageSquare,
      color: 'pink',
      link: '#'
    },
    {
      title: isRTL ? 'منتدى المجتمع' : 'Community Forum',
      description: isRTL ? 'ناقش وشارك الخبرات' : 'Discuss and share experiences',
      icon: Globe,
      color: 'teal',
      link: '#'
    },
  ];

  const training = [
    {
      title: 'PCC Training Modules',
      description: 'Program for Cooperative Cataloging training',
      icon: Video,
      color: 'indigo',
      link: '#'
    },
    {
      title: 'BIBFRAME Training',
      description: 'Learn BIBFRAME fundamentals',
      icon: Book,
      color: 'green',
      link: '#'
    },
    {
      title: 'LOC Authorities Tutorial',
      description: 'Master authority control',
      icon: Users,
      color: 'orange',
      link: '#'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      icon: Video,
      color: 'red',
      link: '#'
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
      red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
      yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
      green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
      pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' },
      teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' },
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isRTL ? 'الموارد والمساعدة' : 'Resources & Help'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL ? 'احصل على المساعدة وتواصل مع المجتمع' : 'Get help and connect with the community'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onBack}>
            {isRTL ? 'رجوع' : 'Back'}
          </Button>
        </div>

        {/* Inspired by Sinopia Banner */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {isRTL ? 'مستوحى من Sinopia' : 'Inspired by Sinopia'}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {isRTL 
                    ? 'Moon هو نظام فهرسة مستوحى من مشروع Sinopia التابع لـ Linked Data for Production 2 (LD4P2)، الذي يتم تمويله بسخاء من قبل مؤسسة Andrew W. Mellon.'
                    : 'Moon is a cataloging system inspired by Sinopia, a project of Linked Data for Production 2 (LD4P2), generously funded by the Andrew W. Mellon Foundation.'
                  }
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-purple-600 text-white">BIBFRAME 3.0.1</Badge>
                  <Badge className="bg-blue-600 text-white">Linked Data</Badge>
                  <Badge className="bg-green-600 text-white">Resource Templates</Badge>
                  <Badge className="bg-pink-600 text-white">Collaborative</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Resources */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {isRTL ? 'موارد المساعدة' : 'Help Resources'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {helpResources.map((resource, index) => {
              const Icon = resource.icon;
              const colors = getColorClasses(resource.color);
              return (
                <Card key={index} className={`hover:shadow-lg transition-shadow border-2 ${colors.border}`}>
                  <CardContent className="pt-6">
                    <div className={`p-3 ${colors.bg} rounded-lg w-fit mb-4`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{resource.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{resource.description}</p>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      {isRTL ? 'افتح' : 'Open'}
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Communication */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {isRTL ? 'التواصل' : 'Communication'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {communication.map((item, index) => {
              const Icon = item.icon;
              const colors = getColorClasses(item.color);
              return (
                <Card key={index} className={`hover:shadow-lg transition-shadow border-2 ${colors.border}`}>
                  <CardContent className="pt-6">
                    <div className={`p-3 ${colors.bg} rounded-lg w-fit mb-4`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      {isRTL ? 'انضم' : 'Join'}
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Training Resources */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Book className="h-5 w-5" />
            {isRTL ? 'موارد التدريب' : 'Training Resources'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {training.map((item, index) => {
              const Icon = item.icon;
              const colors = getColorClasses(item.color);
              return (
                <Card key={index} className={`hover:shadow-lg transition-shadow border-2 ${colors.border}`}>
                  <CardContent className="pt-6">
                    <div className={`p-3 ${colors.bg} rounded-lg w-fit mb-4`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      {isRTL ? 'ابدأ' : 'Start'}
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CC0 Notice */}
        <div className="text-center text-xs text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-6 space-y-2">
          <p>
            <strong>CC0</strong> - {isRTL 
              ? 'جميع البيانات الوصفية المتاحة منشورة بدون قيود، بموجب شروط ترخيص المشاع الإبداعي CC0 1.0 للملكية العامة العالمية.'
              : 'All metadata available are published free of restrictions, under the terms of the Creative Commons CC0 1.0 Universal Public Domain Dedication.'
            }
          </p>
          <p>
            {isRTL
              ? 'إذا كنت لا تستطيع الوصول إلى المحتوى أو استخدام الميزات على هذا الموقع بسبب إعاقة، يرجى الإبلاغ عن مشكلة الوصول الخاصة بك.'
              : 'If you cannot access content or use features on this website due to a disability, please report your accessibility issue.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
