import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Music, FileText, Calendar, Film, Map, Image, Layers } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export type ResourceType = 
  | 'monograph' 
  | 'original-bf' 
  | 'notated-music' 
  | 'serial' 
  | 'moving-image'
  | 'cartographic'
  | 'still-image'
  | 'mixed-material';

interface TypeSelectorProps {
  onTypeSelect: (type: ResourceType) => void;
  onCancel: () => void;
}

export function TypeSelector({ onTypeSelect, onCancel }: TypeSelectorProps) {
  const { t } = useTranslation();

  const resourceTypes: Array<{
    type: ResourceType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      type: 'monograph',
      label: 'Monograph',
      icon: <BookOpen className="h-8 w-8" />,
      description: 'Single-part resources, books, eBooks',
    },
    {
      type: 'original-bf',
      label: 'Original BF',
      icon: <Layers className="h-8 w-8" />,
      description: 'Custom BIBFRAME resource',
    },
    {
      type: 'notated-music',
      label: 'Notated Music',
      icon: <Music className="h-8 w-8" />,
      description: 'Music scores and sheet music',
    },
    {
      type: 'serial',
      label: 'Serial',
      icon: <Calendar className="h-8 w-8" />,
      description: 'Journals, magazines, newspapers',
    },
    {
      type: 'moving-image',
      label: 'Moving Image',
      icon: <Film className="h-8 w-8" />,
      description: 'Video recordings, films',
    },
    {
      type: 'cartographic',
      label: 'Cartographic',
      icon: <Map className="h-8 w-8" />,
      description: 'Maps, atlases, globes',
    },
    {
      type: 'still-image',
      label: 'Still Image',
      icon: <Image className="h-8 w-8" />,
      description: 'Photographs, art reproductions',
    },
    {
      type: 'mixed-material',
      label: 'Mixed Material',
      icon: <FileText className="h-8 w-8" />,
      description: 'Archives, collections',
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('selectResourceType') || 'Select Resource Type'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose the type of bibliographic resource you want to catalog
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {resourceTypes.map((resource) => (
            <Card
              key={resource.type}
              className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-500 bg-white dark:bg-gray-800 bg-[#ffffff]"
              onClick={() => onTypeSelect(resource.type)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 text-blue-600 dark:text-blue-400">
                  {resource.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  {resource.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {resource.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={onCancel}>
            {t('cancel') || 'Cancel'}
          </Button>
        </div>
      </div>
    </div>
  );
}
