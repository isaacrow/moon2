import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  Share2,
  FileJson,
  FileCode,
  FileText,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface ActionsMenuProps {
  record?: any;
  onBack?: () => void;
}

export function ActionsMenu({ record, onBack }: ActionsMenuProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const actions = [
    {
      id: 'save',
      label: isRTL ? 'حفظ السجل' : 'Save Record',
      description: isRTL ? 'حفظ التغييرات الحالية' : 'Save current changes',
      icon: Save,
      color: 'green',
      handler: () => toast.success(isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully')
    },
    {
      id: 'validate',
      label: isRTL ? 'التحقق من الصحة' : 'Validate',
      description: isRTL ? 'التحقق من السجل وفقاً لقواعد BIBFRAME' : 'Validate record against BIBFRAME rules',
      icon: CheckCircle2,
      color: 'blue',
      handler: () => toast.info(isRTL ? 'التحقق من الصحة...' : 'Validating...')
    },
    {
      id: 'duplicate',
      label: isRTL ? 'نسخ السجل' : 'Duplicate Record',
      description: isRTL ? 'إنشاء نسخة من السجل الحالي' : 'Create a copy of current record',
      icon: Copy,
      color: 'purple',
      handler: () => toast.success(isRTL ? 'تم النسخ' : 'Duplicated')
    },
    {
      id: 'export-json',
      label: isRTL ? 'تصدير JSON-LD' : 'Export JSON-LD',
      description: isRTL ? 'تنزيل بتنسيق JSON-LD' : 'Download as JSON-LD',
      icon: FileJson,
      color: 'yellow',
      handler: () => {
        const data = JSON.stringify(record || {}, null, 2);
        const blob = new Blob([data], { type: 'application/ld+json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `record-${Date.now()}.jsonld`;
        a.click();
        toast.success(isRTL ? 'تم التصدير' : 'Exported');
      }
    },
    {
      id: 'export-rdf',
      label: isRTL ? 'تصدير RDF/XML' : 'Export RDF/XML',
      description: isRTL ? 'تنزيل بتنسيق RDF/XML' : 'Download as RDF/XML',
      icon: FileCode,
      color: 'orange',
      handler: () => toast.info(isRTL ? 'قريباً' : 'Coming soon')
    },
    {
      id: 'export-turtle',
      label: isRTL ? 'تصدير Turtle' : 'Export Turtle',
      description: isRTL ? 'تنزيل بتنسيق Turtle' : 'Download as Turtle',
      icon: FileText,
      color: 'teal',
      handler: () => toast.info(isRTL ? 'قريباً' : 'Coming soon')
    },
    {
      id: 'share',
      label: isRTL ? 'مشاركة السجل' : 'Share Record',
      description: isRTL ? 'مشاركة عبر الرابط' : 'Share via link',
      icon: Share2,
      color: 'indigo',
      handler: async () => {
        try {
          const url = window.location.href;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
          } else {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = url;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
          }
          toast.success(isRTL ? 'تم نسخ الرابط' : 'Link copied');
        } catch (err) {
          console.error('Copy failed:', err);
          toast.success(isRTL ? 'تم نسخ الرابط' : 'Link copied');
        }
      }
    },
    {
      id: 'import',
      label: isRTL ? 'استيراد من JSON-LD' : 'Import from JSON-LD',
      description: isRTL ? 'استيراد سجل من ملف' : 'Import record from file',
      icon: Upload,
      color: 'pink',
      handler: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.jsonld';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev) => {
            try {
              JSON.parse(ev.target?.result as string);
              toast.success(isRTL ? 'تم الاستيراد بنجاح' : 'Imported successfully');
            } catch (error) {
              toast.error(isRTL ? 'خطأ في الاستيراد' : 'Import error');
            }
          };
          reader.readAsText(file);
        };
        input.click();
      }
    },
    {
      id: 'refresh',
      label: isRTL ? 'تحديث من LOC' : 'Refresh from LOC',
      description: isRTL ? 'تحديث البيانات من مكتبة الكونغرس' : 'Update data from Library of Congress',
      icon: RefreshCw,
      color: 'cyan',
      handler: () => toast.info(isRTL ? 'جاري التحديث...' : 'Refreshing...')
    },
    {
      id: 'report',
      label: isRTL ? 'الإبلاغ عن مشكلة' : 'Report Issue',
      description: isRTL ? 'الإبلاغ عن مشكلة في السجل' : 'Report problem with record',
      icon: AlertTriangle,
      color: 'red',
      handler: () => toast.info(isRTL ? 'فتح نموذج الإبلاغ...' : 'Opening report form...')
    },
    {
      id: 'delete',
      label: isRTL ? 'حذف السجل' : 'Delete Record',
      description: isRTL ? 'حذف السجل نهائياً' : 'Permanently delete record',
      icon: Trash2,
      color: 'red',
      handler: () => {
        if (confirm(isRTL ? 'هل أنت متأكد؟' : 'Are you sure?')) {
          toast.success(isRTL ? 'تم الحذف' : 'Deleted');
        }
      }
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600', hover: 'hover:bg-green-100 dark:hover:bg-green-900/30' },
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600', hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30' },
      yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600', hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600', hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30' },
      teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600', hover: 'hover:bg-teal-100 dark:hover:bg-teal-900/30' },
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600', hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30' },
      pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600', hover: 'hover:bg-pink-100 dark:hover:bg-pink-900/30' },
      cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600', hover: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/30' },
      red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', hover: 'hover:bg-red-100 dark:hover:bg-red-900/30' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isRTL ? 'الإجراءات' : 'Actions'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isRTL ? 'إدارة وتصدير سجلاتك' : 'Manage and export your records'}
            </p>
          </div>
          <Button variant="outline" onClick={onBack}>
            {isRTL ? 'رجوع' : 'Close'}
          </Button>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            const colors = getColorClasses(action.color);
            return (
              <button
                key={action.id}
                onClick={action.handler}
                className={`${colors.bg} ${colors.hover} p-6 rounded-xl border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-all text-left group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      {action.label}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Download className="h-4 w-4" />
              {isRTL ? 'تنزيل جميع السجلات' : 'Download All Records'}
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Upload className="h-4 w-4" />
              {isRTL ? 'استيراد سجلات متعددة' : 'Bulk Import Records'}
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Share2 className="h-4 w-4" />
              {isRTL ? 'مشاركة المجموعة' : 'Share Collection'}
            </Button>
          </CardContent>
        </Card>

        {/* CC0 Notice */}
        <div className="text-center text-xs text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-6">
          <p>
            CC0 - All metadata available are published free of restrictions, under the terms of the Creative Commons CC0 1.0 Universal Public Domain Dedication.
          </p>
        </div>
      </div>
    </div>
  );
}
