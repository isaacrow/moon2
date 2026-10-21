/**
 * Authority File Manager Component
 * Manages AFIQA authority records for Arabic names
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  BookOpen,
  User,
  Calendar,
  MapPin,
  Briefcase,
  Languages,
  Link as LinkIcon
} from 'lucide-react';
import { afiqaService, AfiqaRecord } from '../services/afiqaService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';

interface AuthorityFileManagerProps {
  onSelect?: (record: AfiqaRecord) => void;
  embedded?: boolean;
}

const AuthorityFileManager: React.FC<AuthorityFileManagerProps> = ({
  onSelect,
  embedded = false
}) => {
  const [records, setRecords] = useState<AfiqaRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AfiqaRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const allRecords = await afiqaService.getAll();
      setRecords(allRecords);
    } catch (error) {
      console.error('Error loading AFIQA records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await afiqaService.search(searchQuery);
      setRecords(results);
    } catch (error) {
      console.error('Error searching AFIQA records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecord = (record: AfiqaRecord) => {
    setSelectedRecord(record);
    if (onSelect) {
      onSelect(record);
    }
  };

  const content = (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="البحث عن سجلات الضبط الاستنادي... / Search authority records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            بحث
          </Button>
          <Button onClick={loadRecords} variant="outline" disabled={loading}>
            الكل
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Records List */}
        <div className="w-1/3 border rounded-lg">
          <div className="p-3 border-b bg-muted/50">
            <h3 className="font-semibold">
              السجلات الاستنادية ({records.length})
            </h3>
          </div>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="p-2 space-y-2">
              {records.map((record) => (
                <Card
                  key={record.id}
                  className={`cursor-pointer hover:bg-accent transition-colors ${
                    selectedRecord?.id === record.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectRecord(record)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">
                        {record.personalName}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {record.afiqaId && (
                          <Badge variant="secondary" className="text-xs">
                            AFIQA: {record.afiqaId}
                          </Badge>
                        )}
                        {record.birthDate && record.deathDate && (
                          <Badge variant="outline" className="text-xs">
                            {record.birthDate} - {record.deathDate}
                          </Badge>
                        )}
                      </div>
                      {record.occupation && record.occupation.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {record.occupation.join(' • ')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {records.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد سجلات
                </div>
              )}
              {loading && (
                <div className="text-center py-8 text-muted-foreground">
                  جاري التحميل...
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Record Details */}
        <div className="flex-1 border rounded-lg overflow-hidden">
          {selectedRecord ? (
            <AuthorityRecordDetails record={selectedRecord} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              اختر سجلاً لعرض التفاصيل
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>إدارة الملفات الاستنادية / Authority File Manager</span>
          </div>
          <Badge variant="outline">AFIQA Integration</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {content}
      </CardContent>
    </Card>
  );
};

/**
 * Authority Record Details Component
 */
const AuthorityRecordDetails: React.FC<{ record: AfiqaRecord }> = ({ record }) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-2">{record.personalName}</h2>
          <div className="flex gap-2 flex-wrap">
            {record.afiqaId && (
              <Badge variant="default">AFIQA ID: {record.afiqaId}</Badge>
            )}
            {record.isni && (
              <Badge variant="secondary">ISNI: {record.isni}</Badge>
            )}
            {record.qid && (
              <Badge variant="secondary">Wikidata: {record.qid}</Badge>
            )}
            {record.lccn && (
              <Badge variant="secondary">LCCN: {record.lccn}</Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            المعلومات الشخصية
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {record.birthDate && (
              <div>
                <Label className="text-muted-foreground">تاريخ الولادة</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{record.birthDate}</span>
                </div>
              </div>
            )}
            {record.deathDate && (
              <div>
                <Label className="text-muted-foreground">تاريخ الوفاة</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{record.deathDate}</span>
                </div>
              </div>
            )}
            {record.birthPlace && (
              <div>
                <Label className="text-muted-foreground">مكان الولادة</Label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{record.birthPlace}</span>
                </div>
              </div>
            )}
            {record.deathPlace && (
              <div>
                <Label className="text-muted-foreground">مكان الوفاة</Label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{record.deathPlace}</span>
                </div>
              </div>
            )}
            {record.burialPlace && (
              <div>
                <Label className="text-muted-foreground">مكان الدفن</Label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{record.burialPlace}</span>
                </div>
              </div>
            )}
            {record.residence && (
              <div>
                <Label className="text-muted-foreground">الإقامة</Label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{record.residence}</span>
                </div>
              </div>
            )}
            {record.gender && (
              <div>
                <Label className="text-muted-foreground">الجنس</Label>
                <div className="mt-1">{record.gender}</div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Professional Information */}
        {(record.occupation || record.fieldOfActivity || record.language) && (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                المعلومات المهنية
              </h3>
              <div className="space-y-3">
                {record.occupation && record.occupation.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">المهنة</Label>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {record.occupation.map((occ, index) => (
                        <Badge key={index} variant="outline">{occ}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {record.fieldOfActivity && record.fieldOfActivity.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">مجال العمل</Label>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {record.fieldOfActivity.map((field, index) => (
                        <Badge key={index} variant="secondary">{field}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {record.language && record.language.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">اللغة</Label>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {record.language.map((lang, index) => (
                        <Badge key={index} variant="outline">
                          <Languages className="w-3 h-3 mr-1" />
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Name Variants */}
        {record.names && record.names.length > 0 && (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-3">إحالات الاسم</h3>
              <div className="space-y-2">
                {record.names.map((name, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant={name.type === 'authorized' ? 'default' : 'secondary'}>
                      {name.type === 'authorized' ? 'الاسم المعتمد' : 'انظر من'}
                    </Badge>
                    <span className={name.type === 'authorized' ? 'font-semibold' : ''}>
                      {name.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Works */}
        {record.works && record.works.length > 0 && (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                عناوين المؤلفات ({record.works.length})
              </h3>
              <div className="space-y-3">
                {record.works.map((work, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="font-semibold mb-2">{work.title}</div>
                      {work.holdings && work.holdings.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {work.holdings.map((holding, hIndex) => (
                            <div key={hIndex} className="flex items-start gap-1">
                              <span className="mt-0.5">•</span>
                              <span>{holding}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Sources */}
        {record.sources && record.sources.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              مصادر المعلومات
            </h3>
            <div className="space-y-2">
              {record.sources.map((source, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="font-semibold text-sm">{source.citation}</div>
                    {source.page && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {source.page}
                      </div>
                    )}
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {source.url}
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default AuthorityFileManager;
