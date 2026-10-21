/**
 * OPAC View Component - Interactive Linked Data Catalog Display
 * Displays JSON-LD BIBFRAME records in a user-friendly OPAC interface
 */

import React, { useState } from 'react';
import { BookOpen, ExternalLink, Network, Database, ChevronDown, ChevronRight } from 'lucide-react';

interface OPACViewProps {
  data: any; // JSON-LD structure with @graph and quads
  theme?: 'glass' | 'neon' | 'classic' | 'clean' | 'blur';
}

export function OPACView({ data, theme = 'glass' }: OPACViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'subjects']));

  const themeClasses = {
    glass: 'bg-white/80 dark:bg-gray-900/80',
    neon: 'bg-gray-900',
    classic: 'bg-amber-50 dark:bg-amber-950/20',
    clean: 'bg-white dark:bg-gray-900',
    blur: 'ios-glossy-black-medium'
  };

  const textClasses = {
    glass: 'text-gray-900 dark:text-gray-100',
    neon: 'text-green-400',
    classic: 'text-amber-900 dark:text-amber-100',
    clean: 'text-gray-900 dark:text-gray-100',
    blur: 'text-white'
  };

  const cardClasses = {
    glass: 'glass-card',
    neon: 'neon-card',
    classic: 'classic-card',
    clean: 'clean-card',
    blur: 'ios-glossy-black-subtle'
  };

  const linkClasses = {
    glass: 'text-blue-600 hover:text-blue-800 dark:text-blue-400',
    neon: 'text-cyan-400 hover:text-cyan-300',
    classic: 'text-amber-700 hover:text-amber-900 dark:text-amber-400',
    clean: 'text-blue-600 hover:text-blue-800',
    blur: 'text-blue-300 hover:text-blue-200'
  };

  const badgeClasses = {
    glass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    neon: 'bg-cyan-500/20 text-cyan-400 border border-cyan-400',
    classic: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    clean: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    blur: 'ios-glossy-black-light text-white/90 border border-white/20'
  };

  // Parse the JSON-LD graph
  const graph = data['@graph'] || [];
  
  // Find Work, Instance, and other entities
  const work = graph.find((node: any) => 
    node['@type']?.includes('bf:Work') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Work')
  );
  
  const instance = graph.find((node: any) => 
    node['@type']?.includes('bf:Instance') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Instance')
  );

  // Helper to resolve node by URI
  const resolveNode = (uri: string) => {
    return graph.find((node: any) => node['@id'] === uri);
  };

  // Helper to get value from node
  const getValue = (node: any) => {
    if (!node) return null;
    if (typeof node === 'string') return node;
    if (node.value) return node.value;
    return null;
  };

  // Get title
  const titleNode = work?.title ? resolveNode(work.title) : null;
  const mainTitle = titleNode?.mainTitle || 'Untitled Work';
  const subtitle = titleNode?.subtitle;

  // Get summary
  const summaryNode = work?.summary ? resolveNode(work.summary) : null;
  const summary = getValue(summaryNode);

  // Get table of contents
  const tocNode = work?.tableOfContents ? resolveNode(work.tableOfContents) : null;
  const toc = getValue(tocNode);

  // Get intended audience
  const audienceNode = work?.intendedAudience ? resolveNode(work.intendedAudience) : null;
  const audience = getValue(audienceNode);

  // Get note
  const noteNode = work?.note ? resolveNode(work.note) : null;
  const note = getValue(noteNode);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Render URI as clickable link
  const renderURI = (uri: string, label?: string) => {
    const displayText = label || uri.split('/').pop() || uri;
    const isExternal = uri.startsWith('http://id.loc.gov/') || uri.startsWith('https://id.loc.gov/');
    
    return (
      <a
        href={uri}
        target="_blank"
        rel="noopener noreferrer"
        className={`${linkClasses[theme]} inline-flex items-center gap-1 hover:underline`}
      >
        <span>{displayText}</span>
        {isExternal && <ExternalLink className="h-3 w-3" />}
      </a>
    );
  };

  // Render array of URIs
  const renderURIList = (uris: string | string[]) => {
    const uriArray = Array.isArray(uris) ? uris : [uris];
    return (
      <div className="flex flex-wrap gap-2">
        {uriArray.map((uri, idx) => (
          <span key={idx} className={`${badgeClasses[theme]} px-3 py-1 rounded-full text-sm`}>
            {renderURI(uri)}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Card */}
      <div className={`${cardClasses[theme]} p-8 rounded-xl`}>
        <div className="flex items-start gap-4">
          <div className={`${theme === 'blur' ? 'ios-glossy-black-light' : 'bg-blue-100 dark:bg-blue-900/30'} p-4 rounded-xl`}>
            <BookOpen className={`h-12 w-12 ${theme === 'blur' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
          </div>
          <div className="flex-1">
            <h1 className={`text-3xl font-bold ${textClasses[theme]} mb-2`}>
              {mainTitle}
            </h1>
            {subtitle && (
              <h2 className={`text-xl ${textClasses[theme]} opacity-80 mb-4`}>
                {subtitle}
              </h2>
            )}
            {instance?.responsibilityStatement && (
              <p className={`text-lg ${textClasses[theme]} opacity-70`}>
                {instance.responsibilityStatement}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className={`${cardClasses[theme]} rounded-xl overflow-hidden`}>
        <button
          onClick={() => toggleSection('basic')}
          className={`w-full px-6 py-4 flex items-center justify-between ${textClasses[theme]} hover:opacity-80 transition-opacity`}
        >
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Basic Information
          </h3>
          {expandedSections.has('basic') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {expandedSections.has('basic') && (
          <div className="px-6 pb-6 space-y-4">
            {instance?.editionStatement && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-1`}>Edition</dt>
                <dd className={`${textClasses[theme]}`}>{instance.editionStatement}</dd>
              </div>
            )}
            
            {work?.originDate && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-1`}>Date</dt>
                <dd className={`${textClasses[theme]}`}>{work.originDate}</dd>
              </div>
            )}
            
            {instance?.dimensions && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-1`}>Physical Description</dt>
                <dd className={`${textClasses[theme]}`}>{instance.dimensions}</dd>
              </div>
            )}
            
            {instance?.seriesStatement && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-1`}>Series</dt>
                <dd className={`${textClasses[theme]}`}>{instance.seriesStatement}</dd>
              </div>
            )}
            
            {work?.language && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-1`}>Language</dt>
                <dd>{renderURIList(work.language)}</dd>
              </div>
            )}
            
            {work?.content && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-1`}>Content Type</dt>
                <dd>{renderURIList(work.content)}</dd>
              </div>
            )}
            
            {instance?.media && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-1`}>Media Type</dt>
                <dd>{renderURIList(instance.media)}</dd>
              </div>
            )}
            
            {instance?.carrier && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-1`}>Carrier Type</dt>
                <dd>{renderURIList(instance.carrier)}</dd>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary & Description */}
      {(summary || toc || note) && (
        <div className={`${cardClasses[theme]} rounded-xl overflow-hidden`}>
          <button
            onClick={() => toggleSection('description')}
            className={`w-full px-6 py-4 flex items-center justify-between ${textClasses[theme]} hover:opacity-80 transition-opacity`}
          >
            <h3 className="text-xl font-semibold">Description</h3>
            {expandedSections.has('description') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
          
          {expandedSections.has('description') && (
            <div className="px-6 pb-6 space-y-4">
              {summary && (
                <div>
                  <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-2`}>Summary</dt>
                  <dd className={`${textClasses[theme]} leading-relaxed`}>{summary}</dd>
                </div>
              )}
              
              {toc && (
                <div>
                  <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-2`}>Table of Contents</dt>
                  <dd className={`${textClasses[theme]} leading-relaxed`}>{toc}</dd>
                </div>
              )}
              
              {note && (
                <div>
                  <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-2`}>Notes</dt>
                  <dd className={`${textClasses[theme]} leading-relaxed`}>{note}</dd>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subjects & Classification */}
      <div className={`${cardClasses[theme]} rounded-xl overflow-hidden`}>
        <button
          onClick={() => toggleSection('subjects')}
          className={`w-full px-6 py-4 flex items-center justify-between ${textClasses[theme]} hover:opacity-80 transition-opacity`}
        >
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Network className="h-5 w-5" />
            Subjects & Topics
          </h3>
          {expandedSections.has('subjects') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {expandedSections.has('subjects') && (
          <div className="px-6 pb-6 space-y-4">
            {work?.subject && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-2`}>Subjects</dt>
                <dd>{renderURIList(work.subject)}</dd>
              </div>
            )}
            
            {work?.topical && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-2`}>Topical Terms</dt>
                <dd>{renderURIList(work.topical)}</dd>
              </div>
            )}
            
            {work?.genreForm && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-2`}>Genre/Form</dt>
                <dd>{renderURIList(work.genreForm)}</dd>
              </div>
            )}
            
            {work?.geographicCoverage && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-2`}>Geographic Coverage</dt>
                <dd>{renderURIList(work.geographicCoverage)}</dd>
              </div>
            )}
            
            {work?.originPlace && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-2`}>Place of Origin</dt>
                <dd>{renderURIList(work.originPlace)}</dd>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audience */}
      {audience && (
        <div className={`${cardClasses[theme]} rounded-xl overflow-hidden`}>
          <button
            onClick={() => toggleSection('audience')}
            className={`w-full px-6 py-4 flex items-center justify-between ${textClasses[theme]} hover:opacity-80 transition-opacity`}
          >
            <h3 className="text-xl font-semibold">Intended Audience</h3>
            {expandedSections.has('audience') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
          
          {expandedSections.has('audience') && (
            <div className="px-6 pb-6">
              <p className={`${textClasses[theme]}`}>{audience}</p>
            </div>
          )}
        </div>
      )}

      {/* Linked Data URIs */}
      <div className={`${cardClasses[theme]} rounded-xl overflow-hidden`}>
        <button
          onClick={() => toggleSection('uris')}
          className={`w-full px-6 py-4 flex items-center justify-between ${textClasses[theme]} hover:opacity-80 transition-opacity`}
        >
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Network className="h-5 w-5" />
            Linked Data Identifiers
          </h3>
          {expandedSections.has('uris') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {expandedSections.has('uris') && (
          <div className="px-6 pb-6 space-y-3">
            {work?.['@id'] && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-1`}>Work URI</dt>
                <dd className="font-mono text-sm">{renderURI(work['@id'])}</dd>
              </div>
            )}
            
            {instance?.['@id'] && (
              <div>
                <dt className={`text-sm font-semibold ${textClasses[theme]} opacity-70 mb-1`}>Instance URI</dt>
                <dd className="font-mono text-sm">{renderURI(instance['@id'])}</dd>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
