import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy,
  Download,
  Upload,
  Filter,
  BookOpen,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  templateId: string;
  class: string;
  label: string;
  author: string;
  date: string;
  remark: string;
  propertyCount: number;
}

interface TemplateManagerProps {
  onCreateNew?: () => void;
  onEdit?: (template: Template) => void;
  onBack?: () => void;
}

export function TemplateManager({ onCreateNew, onEdit, onBack }: TemplateManagerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'work' | 'instance' | 'item'>('all');

  // Load templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('resource-templates');
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    } else {
      // Load default templates
      const defaultTemplates: Template[] = [
        {
          id: '1',
          templateId: 'sinopia:template:bf2:Monograph:Work',
          class: 'http://id.loc.gov/ontologies/bibframe/Work',
          label: 'Monograph Work',
          author: 'Moon System',
          date: '2024-02-14',
          remark: 'Template for monographic works',
          propertyCount: 12
        },
        {
          id: '2',
          templateId: 'sinopia:template:bf2:Monograph:Instance',
          class: 'http://id.loc.gov/ontologies/bibframe/Instance',
          label: 'Monograph Instance',
          author: 'Moon System',
          date: '2024-02-14',
          remark: 'Template for monographic instances',
          propertyCount: 15
        },
        {
          id: '3',
          templateId: 'sinopia:template:bf2:Serial:Work',
          class: 'http://id.loc.gov/ontologies/bibframe/Work',
          label: 'Serial Work',
          author: 'Moon System',
          date: '2024-02-14',
          remark: 'Template for continuing resources',
          propertyCount: 14
        },
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem('resource-templates', JSON.stringify(defaultTemplates));
    }
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.templateId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    
    const classLower = template.class.toLowerCase();
    if (filterType === 'work') return matchesSearch && classLower.includes('work');
    if (filterType === 'instance') return matchesSearch && classLower.includes('instance');
    if (filterType === 'item') return matchesSearch && classLower.includes('item');
    
    return matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا القالب؟' : 'Are you sure you want to delete this template?')) {
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      localStorage.setItem('resource-templates', JSON.stringify(updated));
      toast.success(isRTL ? 'تم حذف القالب' : 'Template deleted');
    }
  };

  const handleDuplicate = (template: Template) => {
    const duplicate = {
      ...template,
      id: `template-${Date.now()}`,
      templateId: `${template.templateId}-copy`,
      label: `${template.label} (Copy)`,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [...templates, duplicate];
    setTemplates(updated);
    localStorage.setItem('resource-templates', JSON.stringify(updated));
    toast.success(isRTL ? 'تم نسخ القالب' : 'Template duplicated');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `templates-${Date.now()}.json`;
    link.click();
    toast.success(isRTL ? 'تم تصدير القوالب' : 'Templates exported');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isRTL ? 'إدارة قوالب الموارد' : 'Resource Templates'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL ? 'إنشاء وإدارة قوالب BIBFRAME' : 'Create and manage BIBFRAME templates'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              {isRTL ? 'رجوع' : 'Back'}
            </Button>
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              {isRTL ? 'قالب جديد' : 'New Template'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600">{templates.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'إجمالي القوالب' : 'Total Templates'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">
                {templates.filter(t => t.class.includes('Work')).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'قوالب الأعمال' : 'Work Templates'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">
                {templates.filter(t => t.class.includes('Instance')).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'قوالب النسخ' : 'Instance Templates'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600">
                {templates.filter(t => t.class.includes('Item')).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'قوالب المفردات' : 'Item Templates'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? 'البحث في القوالب...' : 'Search templates...'}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  {isRTL ? 'الكل' : 'All'}
                </Button>
                <Button
                  variant={filterType === 'work' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('work')}
                >
                  {isRTL ? 'الأعمال' : 'Works'}
                </Button>
                <Button
                  variant={filterType === 'instance' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('instance')}
                >
                  {isRTL ? 'النسخ' : 'Instances'}
                </Button>
                <Button
                  variant={filterType === 'item' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('item')}
                >
                  {isRTL ? 'المفردات' : 'Items'}
                </Button>
              </div>
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                {isRTL ? 'تصدير' : 'Export'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTemplates.length === 0 ? (
            <Card className="lg:col-span-2">
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  {isRTL ? 'لا توجد قوالب' : 'No templates found'}
                </p>
                <Button onClick={onCreateNew} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  {isRTL ? 'إنشاء قالب جديد' : 'Create New Template'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {template.class.includes('Work') && <BookOpen className="h-5 w-5 text-blue-600" />}
                        {template.class.includes('Instance') && <FileText className="h-5 w-5 text-green-600" />}
                        {template.class.includes('Item') && <Settings className="h-5 w-5 text-orange-600" />}
                        {template.label}
                      </CardTitle>
                      <CardDescription className="font-mono text-xs mt-1">
                        {template.templateId}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{template.propertyCount} {isRTL ? 'خصائص' : 'properties'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'الفئة:' : 'Class:'}</span>
                      <span className="font-mono text-xs">{template.class.split('/').pop()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'المؤلف:' : 'Author:'}</span>
                      <span>{template.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'التاريخ:' : 'Date:'}</span>
                      <span>{template.date}</span>
                    </div>
                  </div>

                  {template.remark && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {template.remark}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => onEdit?.(template)}
                    >
                      <Edit className="h-4 w-4" />
                      {isRTL ? 'تحرير' : 'Edit'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer (Sinopia-style) */}
        <div className="text-center text-xs text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-6 space-y-2">
          <p>
            <strong>Moon</strong> - Inspired by Sinopia (LD4P2), a project funded by the Andrew W. Mellon Foundation
          </p>
          <p>
            CC0 - All metadata available are published free of restrictions, under the terms of the Creative Commons CC0 1.0 Universal Public Domain Dedication.
          </p>
        </div>
      </div>
    </div>
  );
}
