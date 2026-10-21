import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BIBFRAMERecord } from '../types/bibframe';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  BookOpen, 
  Search, 
  User, 
  Calendar, 
  MapPin, 
  Tag, 
  Barcode,
  ExternalLink,
  Download,
  Share2,
  Bookmark,
  Eye
} from 'lucide-react';

interface OPACViewProps {
  record: BIBFRAMERecord;
  onClose?: () => void;
}

export function OPACView({ record, onClose }: OPACViewProps) {
  const { t } = useTranslation();
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const work = record.work;
  const instance = record.instance;

  // Extract ISBN for cover image
  const isbn = instance['bf:identifiedBy']?.find(
    (id) => id['@type'] === 'bf:Isbn'
  )?.['rdf:value'];

  React.useEffect(() => {
    if (isbn) {
      setCoverImage(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
    }
  }, [isbn]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Library Catalog
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-96">
                <Input
                  type="search"
                  placeholder="Search catalog..."
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Back to Editor
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cover & Actions */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full rounded-lg shadow-md mb-4"
                    onError={() => setCoverImage(null)}
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                <div className="space-y-2">
                  <Button className="w-full" variant="default">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Citation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="text-sm font-medium">Main Library</span>
                    <Badge variant="default" className="bg-green-600">
                      Available
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <p>Call Number: {work['bf:classification']?.[0]?.['bf:classificationPortion'] || 'N/A'}</p>
                    <p>Location: General Collection</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bibliographic Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section */}
            <Card>
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {work['bf:title']?.['bf:mainTitle'] || instance['bf:title']?.['bf:mainTitle'] || 'Untitled'}
                </h1>
                {instance['bf:responsibilityStatement'] && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    {instance['bf:responsibilityStatement']}
                  </p>
                )}

                {/* Creators */}
                {work['bf:creator'] && work['bf:creator'].length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div className="flex flex-wrap gap-2">
                      {work['bf:creator'].map((creator, idx) => (
                        <a
                          key={idx}
                          href={creator.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {creator.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Publication Info */}
                {instance['bf:provisionActivity'] && instance['bf:provisionActivity'].length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mt-0.5" />
                    <div>
                      {instance['bf:provisionActivity'][0]['bf:agent']?.['rdfs:label'] && (
                        <span>{instance['bf:provisionActivity'][0]['bf:agent']['rdfs:label']}, </span>
                      )}
                      {instance['bf:provisionActivity'][0]['bf:date'] && (
                        <span>{instance['bf:provisionActivity'][0]['bf:date']}</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Bibliographic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Identifiers */}
                {instance['bf:identifiedBy'] && instance['bf:identifiedBy'].length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Barcode className="h-4 w-4" />
                      Identifiers
                    </h3>
                    <div className="space-y-1 text-sm">
                      {instance['bf:identifiedBy'].map((id, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="outline">
                            {id['@type'].replace('bf:', '')}
                          </Badge>
                          <span className="text-gray-600 dark:text-gray-400">
                            {id['rdf:value']}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edition */}
                {instance['bf:editionStatement'] && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Edition
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {instance['bf:editionStatement']}
                    </p>
                  </div>
                )}

                {/* Responsibility Statement */}
                {instance['bf:responsibilityStatement'] && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Statement of Responsibility
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {instance['bf:responsibilityStatement']}
                    </p>
                  </div>
                )}

                {/* Series Statement */}
                {instance['bf:seriesStatement'] && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Series
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {instance['bf:seriesStatement']}
                    </p>
                  </div>
                )}

                {/* Physical Description */}
                {(instance['bf:extent'] || instance['bf:dimensions']) && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Physical Description
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {instance['bf:extent'] && (
                        <p>Extent: {instance['bf:extent']['rdfs:label']}</p>
                      )}
                      {instance['bf:dimensions'] && (
                        <p>Dimensions: {instance['bf:dimensions']}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Language */}
                {work['bf:language'] && work['bf:language'].length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {work['bf:language'].map((lang, idx) => (
                        <Badge key={idx} variant="secondary">
                          {lang['rdfs:label']}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subjects */}
                {work['bf:subject'] && work['bf:subject'].length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Subjects
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {work['bf:subject'].map((subject, idx) => (
                        <Badge key={idx} variant="secondary">
                          <a
                            href={subject.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            {subject.label}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Genre/Form */}
                {work['bf:genreForm'] && work['bf:genreForm'].length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Genre/Form
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {work['bf:genreForm'].map((genre, idx) => (
                        <Badge key={idx} variant="outline">
                          {genre.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {work['bf:summary'] && work['bf:summary'].length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Summary
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      {work['bf:summary'].map((summary, idx) => (
                        <p key={idx}>{summary['rdfs:label'] || summary}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {(work['bf:note'] || instance['bf:note']) && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {(work['bf:note'] || []).map((note: any, idx: number) => (
                        <p key={`work-note-${idx}`}>• {note['rdfs:label'] || note.value || note}</p>
                      ))}
                      {(instance['bf:note'] || []).map((note: any, idx: number) => (
                        <p key={`inst-note-${idx}`}>• {note['rdfs:label'] || note.value || note}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contributors (beyond creators) */}
                {work['bf:contributor'] && work['bf:contributor'].length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Contributors
                    </h3>
                    <div className="space-y-1 text-sm">
                      {work['bf:contributor'].map((contrib: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <a
                            href={contrib.uri || contrib['@id']}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {contrib.label || contrib['rdfs:label']}
                          </a>
                          {contrib.role && (
                            <Badge variant="outline" className="text-xs">
                              {contrib.role}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Table of Contents */}
                {work['bf:tableOfContents'] && work['bf:tableOfContents'].length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Contents
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {work['bf:tableOfContents'].map((toc, idx) => (
                        <p key={idx}>{toc['rdfs:label']}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Classification */}
                {work['bf:classification'] && work['bf:classification'].length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Classification
                    </h3>
                    <div className="space-y-1 text-sm">
                      {work['bf:classification'].map((cls, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="outline">
                            {cls['@type'].replace('bf:Classification', '')}
                          </Badge>
                          <span className="text-gray-600 dark:text-gray-400">
                            {cls['bf:classificationPortion']}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* BIBFRAME Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Linked Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {work['@id'] && (
                    <Badge variant="outline" className="text-xs">
                      <a
                        href={work['@id']}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        Work URI
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Badge>
                  )}
                  {instance['@id'] && (
                    <Badge variant="outline" className="text-xs">
                      <a
                        href={instance['@id']}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        Instance URI
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
