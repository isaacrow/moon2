import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Search, 
  ExternalLink, 
  Book, 
  Code, 
  Database,
  Layers,
  Package,
  GitBranch,
  FileText,
  Server,
  Globe,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { folioModules } from '../data/folioModules';

interface FOLIOModuleBrowserProps {
  onBack?: () => void;
}

export function FOLIOModuleBrowser({ onBack }: FOLIOModuleBrowserProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Categories with counts
  const categories = useMemo(() => {
    const cats = [
      { id: 'all', label: 'All Modules', icon: Package, count: folioModules.length },
      { id: 'ui', label: 'Frontend UI', icon: Globe, count: folioModules.filter(m => m.category === 'ui').length },
      { id: 'ui-plugin', label: 'UI Plugins', icon: Layers, count: folioModules.filter(m => m.category === 'ui-plugin').length },
      { id: 'mod', label: 'Backend Modules', icon: Server, count: folioModules.filter(m => m.category === 'mod').length },
      { id: 'edge', label: 'Edge APIs', icon: GitBranch, count: folioModules.filter(m => m.category === 'edge').length },
      { id: 'stripes', label: 'Stripes Framework', icon: Code, count: folioModules.filter(m => m.category === 'stripes').length },
      { id: 'platform', label: 'Platforms', icon: Database, count: folioModules.filter(m => m.category === 'platform').length },
    ];
    return cats;
  }, []);

  // Filtered modules
  const filteredModules = useMemo(() => {
    return folioModules.filter(module => {
      const matchesSearch = 
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'ui': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'ui-plugin': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'mod': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'edge': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'stripes': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'platform': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const ModuleCard = ({ module }: { module: typeof folioModules[0] }) => {
    const isExpanded = expandedModule === module.id;

    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCategoryColor(module.category)}>
                  {module.category}
                </Badge>
                {module.repositories && (
                  <Badge variant="outline" className="text-xs">
                    {module.repositories} repos
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg font-mono">{module.name}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {module.description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedModule(isExpanded ? null : module.id)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-3 pt-0 border-t">
            <div className="grid grid-cols-1 gap-2 mt-4">
              {module.github && (
                <a
                  href={module.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
                >
                  <Code className="h-4 w-4 text-gray-600" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
              
              {module.apiDocs && (
                <a
                  href={module.apiDocs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
                >
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span>API Documentation</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}

              {module.userDocs && (
                <a
                  href={module.userDocs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
                >
                  <BookOpen className="h-4 w-4 text-gray-600" />
                  <span>User Documentation</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}

              {module.settings && (
                <a
                  href={module.settings}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
                >
                  <Database className="h-4 w-4 text-gray-600" />
                  <span>Settings Documentation</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
            </div>

            {module.tags && module.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {module.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isRTL ? 'متصفح وحدات FOLIO' : 'FOLIO Module Browser'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL 
                  ? `استكشف ${folioModules.length} وحدة من منصة FOLIO`
                  : `Explore ${folioModules.length} modules from the FOLIO platform`
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={onBack}>
              {isRTL ? 'رجوع' : 'Back'}
            </Button>
          </div>
        </div>

        {/* FOLIO Info Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <Book className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {isRTL ? 'عن منصة FOLIO' : 'About FOLIO Platform'}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {isRTL
                    ? 'FOLIO (مستقبل المكتبات مفتوح) هي منصة خدمات مكتبية حديثة مبنية على الخدمات المصغرة، وهي تعاون فريد بين المكتبات والمطورين والبائعين. تتضمن أكثر من 377 مستودع بما في ذلك واجهات المستخدم والوحدات الخلفية وواجهات برمجة التطبيقات.'
                    : 'FOLIO (The Future of Libraries is Open) is a modern, microservices-based library services platform. It is a unique collaboration of libraries, developers, and vendors, comprising 377+ repositories including UI modules, backend modules, and APIs.'
                  }
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-600 text-white">Open Source</Badge>
                  <Badge className="bg-purple-600 text-white">Microservices</Badge>
                  <Badge className="bg-green-600 text-white">RESTful APIs</Badge>
                  <Badge className="bg-pink-600 text-white">Modular Architecture</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? 'البحث في الوحدات...' : 'Search modules...'}
                  className="pl-10"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <Button
                      key={cat.id}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {cat.label}
                      <Badge variant={isActive ? 'secondary' : 'outline'} className="ml-1">
                        {cat.count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">{categories.find(c => c.id === 'ui')?.count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'وحدات واجهة المستخدم' : 'UI Modules'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">{categories.find(c => c.id === 'mod')?.count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'الوحدات الخلفية' : 'Backend Modules'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600">{categories.find(c => c.id === 'edge')?.count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'واجهات Edge' : 'Edge APIs'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-pink-600">{categories.find(c => c.id === 'stripes')?.count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'إطار Stripes' : 'Stripes Framework'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRTL 
                ? `${filteredModules.length} وحدة`
                : `${filteredModules.length} Modules`
              }
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isRTL ? 'آخر تحديث: 13 فبراير 2026' : 'Last updated: February 13, 2026'}
            </div>
          </div>

          {filteredModules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  {isRTL ? 'لم يتم العثور على وحدات' : 'No modules found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
            }>
              {filteredModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-6 space-y-2">
          <p>
            <strong>FOLIO</strong> - The Future of Libraries is Open
          </p>
          <p>
            {isRTL
              ? 'جميع الوحدات مفتوحة المصدر ومتاحة على GitHub تحت تراخيص Apache 2.0'
              : 'All modules are open source and available on GitHub under Apache 2.0 licenses'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
