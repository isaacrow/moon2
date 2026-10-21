/**
 * Moon Engine Glass Wrapper with OPAC Viewer
 * This wraps the existing MoonEngineGlass and adds OPAC Viewer button + dialog
 */

import React, { useState } from 'react';
import { MoonEngineGlass } from './MoonEngineGlass';
import { OpacViewerDialog } from './OpacViewerDialog';
import { Book } from 'lucide-react';
import '../../styles/glassmorphism.css';

interface MoonEngineGlassWithOpacProps {
  onBack?: () => void;
}

export function MoonEngineGlassWithOpac({ onBack }: MoonEngineGlassWithOpacProps) {
  const [showOpacViewer, setShowOpacViewer] = useState(false);

  // Get current record data from localStorage (same as handleSave in MoonEngineGlass)
  const getCurrentRecord = () => {
    const existingRecords = JSON.parse(
      localStorage.getItem('bibframe-records') || '[]'
    );
    
    // Get the most recent record
    if (existingRecords.length > 0) {
      return existingRecords[existingRecords.length - 1];
    }
    
    return null;
  };

  return (
    <div className="relative h-full">
      {/* Original Moon Engine */}
      <MoonEngineGlass onBack={onBack} />

      {/* Floating OPAC Viewer Button */}
      <button
        onClick={() => {
          window.location.href = '/opac.html';
        }}
        className="fixed bottom-8 right-8 glass-button px-6 py-3 flex items-center gap-2 shadow-2xl z-40"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        <Book className="h-5 w-5 text-white" />
        <span className="text-white font-medium">OPAC Viewer</span>
      </button>

      {/* OPAC Viewer Dialog */}
      <OpacViewerDialog
        isOpen={showOpacViewer}
        onClose={() => setShowOpacViewer(false)}
        recordData={getCurrentRecord()}
      />
    </div>
  );
}
