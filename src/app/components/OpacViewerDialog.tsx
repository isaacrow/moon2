// OPAC Viewer Dialog - Shows BIBFRAME records in library catalog style
import { useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { OpacRecordView } from './OpacRecordView';
import { useThemeSafe } from '../hooks/useThemeSafe';

interface OpacViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recordData: any; // BIBFRAME JSON-LD data
}

export function OpacViewerDialog({ isOpen, onClose, recordData }: OpacViewerDialogProps) {
  const { moonEngineTheme } = useThemeSafe();

  if (!isOpen) return null;

  // Convert record format to @graph format if needed
  let graphData = recordData;
  
  if (recordData && !recordData['@graph'] && recordData.work) {
    // Convert from work/instance format to @graph format
    const work = { ...recordData.work, '@type': 'bf:Work' };
    const instance = { ...recordData.instance, '@type': 'bf:Instance' };
    
    graphData = {
      '@context': recordData['@context'] || 'http://id.loc.gov/ontologies/bibframe/',
      '@graph': [work, instance]
    };
  }

  // Check if we have valid BIBFRAME data
  const hasValidData = graphData && graphData['@graph'] && graphData['@graph'].length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="glass-navbar px-6 py-4 flex items-center justify-between border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              BIBFRAME OPAC Viewer
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Library Catalog Display
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {hasValidData ? (
            <OpacRecordView data={graphData} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="text-6xl text-gray-400">
                  <BookOpen className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  No Record Data Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Create or select a BIBFRAME record to view it in OPAC format
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}