import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Plus, 
  X, 
  Save, 
  FileText, 
  Settings,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface PropertyTemplate {
  id: string;
  propertyUri: string;
  label: string;
  remark?: string;
  remarkUrl?: string;
  propertyType: 'literal' | 'uri' | 'lookup' | 'resource';
  required?: boolean;
  repeatable?: boolean;
  attributes?: string[];
}

interface ResourceTemplate {
  id: string;
  templateId: string;
  class: string;
  optionalClasses: string[];
  label: string;
  author: string;
  remark: string;
  date: string;
  resourceAttributes: string[];
  propertyTemplates: PropertyTemplate[];
}

interface ResourceTemplateEditorProps {
  onSave?: (template: ResourceTemplate) => void;
  onCancel?: () => void;
  existingTemplate?: ResourceTemplate;
}

export function ResourceTemplateEditor({ onSave, onCancel, existingTemplate }: ResourceTemplateEditorProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [template, setTemplate] = useState<ResourceTemplate>(existingTemplate || {
    id: `template-${Date.now()}`,
    templateId: '',
    class: '',
    optionalClasses: [],
    label: '',
    author: '',
    remark: '',
    date: new Date().toISOString().split('T')[0],
    resourceAttributes: [],
    propertyTemplates: [],
  });

  const [newOptionalClass, setNewOptionalClass] = useState('');
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  const addOptionalClass = () => {
    if (newOptionalClass.trim()) {
      setTemplate({
        ...template,
        optionalClasses: [...template.optionalClasses, newOptionalClass.trim()]
      });
      setNewOptionalClass('');
    }
  };

  const removeOptionalClass = (index: number) => {
    setTemplate({
      ...template,
      optionalClasses: template.optionalClasses.filter((_, i) => i !== index)
    });
  };

  const addPropertyTemplate = () => {
    const newProperty: PropertyTemplate = {
      id: `prop-${Date.now()}`,
      propertyUri: '',
      label: '',
      propertyType: 'literal',
      required: false,
      repeatable: false,
    };
    setTemplate({
      ...template,
      propertyTemplates: [...template.propertyTemplates, newProperty]
    });
    setExpandedProperty(newProperty.id);
  };

  const updatePropertyTemplate = (id: string, updates: Partial<PropertyTemplate>) => {
    setTemplate({
      ...template,
      propertyTemplates: template.propertyTemplates.map(prop =>
        prop.id === id ? { ...prop, ...updates } : prop
      )
    });
  };

  const removePropertyTemplate = (id: string) => {
    setTemplate({
      ...template,
      propertyTemplates: template.propertyTemplates.filter(prop => prop.id !== id)
    });
  };

  const handleSave = () => {
    if (!template.templateId || !template.class || !template.label) {
      toast.error(isRTL ? 'الرجاء ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }

    onSave?.(template);
    toast.success(isRTL ? 'تم حفظ القالب بنجاح' : 'Template saved successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isRTL ? 'محرر قالب الموارد' : 'Resource Template Editor'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL ? 'إنشاء وتحرير قوالب BIBFRAME' : 'Create and edit BIBFRAME templates'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'معلومات القالب الأساسية' : 'Template Information'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateId">
                  {isRTL ? 'معرف القالب' : 'Template ID'} *
                </Label>
                <Input
                  id="templateId"
                  value={template.templateId}
                  onChange={(e) => setTemplate({ ...template, templateId: e.target.value })}
                  placeholder="e.g., sinopia:template:bf2:Monograph"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="class">
                  {isRTL ? 'الفئة' : 'Class'} *
                </Label>
                <Input
                  id="class"
                  value={template.class}
                  onChange={(e) => setTemplate({ ...template, class: e.target.value })}
                  placeholder="http://id.loc.gov/ontologies/bibframe/Work"
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="label">
                  {isRTL ? 'تسمية القالب' : 'Template Label'} *
                </Label>
                <Input
                  id="label"
                  value={template.label}
                  onChange={(e) => setTemplate({ ...template, label: e.target.value })}
                  placeholder={isRTL ? 'مثال: عمل مونوغرافي' : 'e.g., Monograph Work'}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="author">
                  {isRTL ? 'المؤلف' : 'Author'}
                </Label>
                <Input
                  id="author"
                  value={template.author}
                  onChange={(e) => setTemplate({ ...template, author: e.target.value })}
                  placeholder={isRTL ? 'اسم المؤلف' : 'Author name'}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="date">
                  {isRTL ? 'التاريخ' : 'Date'}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={template.date}
                  onChange={(e) => setTemplate({ ...template, date: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="remark">
                  {isRTL ? 'ملاحظة' : 'Remark'}
                </Label>
                <Textarea
                  id="remark"
                  value={template.remark}
                  onChange={(e) => setTemplate({ ...template, remark: e.target.value })}
                  placeholder={isRTL ? 'أدخل ملاحظة عن القالب' : 'Enter template remark'}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              {isRTL ? 'الفئات الاختيارية' : 'Optional Classes'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newOptionalClass}
                onChange={(e) => setNewOptionalClass(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addOptionalClass()}
                placeholder="http://id.loc.gov/ontologies/bibframe/..."
              />
              <Button onClick={addOptionalClass}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {template.optionalClasses.map((cls, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border dark:border-blue-800">
                  <span className="text-sm font-mono truncate">{cls}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOptionalClass(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Templates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {isRTL ? 'قوالب الخصائص' : 'Property Templates'}
              </CardTitle>
              <Button onClick={addPropertyTemplate} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                {isRTL ? 'إضافة خاصية' : 'Add Property'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {template.propertyTemplates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{isRTL ? 'لا توجد خصائص. انقر "إضافة خاصية" للبدء.' : 'No properties. Click "Add Property" to start.'}</p>
              </div>
            ) : (
              template.propertyTemplates.map((prop) => (
                <div key={prop.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750"
                    onClick={() => setExpandedProperty(expandedProperty === prop.id ? null : prop.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedProperty === prop.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <div>
                        <h4 className="font-semibold">{prop.label || isRTL ? 'خاصية جديدة' : 'New Property'}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">{prop.propertyUri || 'No URI'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={prop.required ? 'default' : 'secondary'}>
                        {prop.required ? (isRTL ? 'مطلوب' : 'Required') : (isRTL ? 'اختياري' : 'Optional')}
                      </Badge>
                      <Badge variant="outline">{prop.propertyType}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePropertyTemplate(prop.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {expandedProperty === prop.id && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label>{isRTL ? 'URI الخاصية' : 'Property URI'} *</Label>
                          <Input
                            value={prop.propertyUri}
                            onChange={(e) => updatePropertyTemplate(prop.id, { propertyUri: e.target.value })}
                            placeholder="http://id.loc.gov/ontologies/bibframe/..."
                            className="mt-1 font-mono text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>{isRTL ? 'التسمية' : 'Label'} *</Label>
                          <Input
                            value={prop.label}
                            onChange={(e) => updatePropertyTemplate(prop.id, { label: e.target.value })}
                            placeholder={isRTL ? 'تسمية الخاصية' : 'Property label'}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>{isRTL ? 'نوع الخاصية' : 'Property Type'} *</Label>
                          <select
                            value={prop.propertyType}
                            onChange={(e) => updatePropertyTemplate(prop.id, { propertyType: e.target.value as any })}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                          >
                            <option value="literal">{isRTL ? 'حرفي' : 'Literal'}</option>
                            <option value="uri">URI</option>
                            <option value="lookup">{isRTL ? 'بحث' : 'Lookup'}</option>
                            <option value="resource">{isRTL ? 'مورد متداخل' : 'Nested Resource'}</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-4 pt-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={prop.required}
                              onChange={(e) => updatePropertyTemplate(prop.id, { required: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm">{isRTL ? 'مطلوب' : 'Required'}</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={prop.repeatable}
                              onChange={(e) => updatePropertyTemplate(prop.id, { repeatable: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm">{isRTL ? 'قابل للتكرار' : 'Repeatable'}</span>
                          </label>
                        </div>

                        <div className="md:col-span-2">
                          <Label>{isRTL ? 'ملاحظة' : 'Remark'}</Label>
                          <Textarea
                            value={prop.remark || ''}
                            onChange={(e) => updatePropertyTemplate(prop.id, { remark: e.target.value })}
                            placeholder={isRTL ? 'أدخل ملاحظة' : 'Enter remark'}
                            rows={2}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* CC0 Notice (Sinopia-style) */}
        <div className="text-center text-xs text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-6">
          <p>
            CC0 - All metadata available are published free of restrictions, under the terms of the Creative Commons CC0 1.0 Universal Public Domain Dedication.
          </p>
        </div>
      </div>
    </div>
  );
}
