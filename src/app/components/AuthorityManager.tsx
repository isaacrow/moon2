/**
 * 🎯 AUTHORITY MANAGER
 * Professional authority control with search, deduplication, and merging
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, AlertTriangle, CheckCircle2, Link2, Merge, ExternalLink, Loader2, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Authority {
  id: string;
  uri: string;
  type: 'Person' | 'Organization' | 'Topic' | 'Place' | 'Work' | 'GenreForm';
  label: string;
  alternateLabels?: string[];
  externalLinks?: {
    viaf?: string;
    lc?: string;
    wikidata?: string;
    isni?: string;
    orcid?: string;
  };
  metadata: {
    created: string;
    modified: string;
    source?: 'local' | 'imported' | 'external';
    verified?: boolean;
    usageCount?: number;
  };
}

interface Duplicate {
  authority: Authority;
  similarity: number;
  reasons: string[];
}

export function AuthorityManager() {
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [selectedAuthority, setSelectedAuthority] = useState<Authority | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAuthorities();
  }, [typeFilter]);

  const loadAuthorities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/authorities?${params}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAuthorities(data.authorities || []);
      }
    } catch (error) {
      console.error('Load authorities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchAuthorities = async () => {
    if (!searchQuery.trim()) {
      loadAuthorities();
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ q: searchQuery });
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/authorities/search?${params}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAuthorities(data.authorities || []);
      }
    } catch (error) {
      console.error('Search authorities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const findDuplicates = async (authorityId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/authorities/${authorityId}/duplicates`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDuplicates(data.duplicates || []);
        setShowDuplicates(true);
      }
    } catch (error) {
      console.error('Find duplicates error:', error);
    }
  };

  const mergeAuthorities = async () => {
    if (!selectedAuthority || selectedForMerge.size === 0) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/authorities/merge`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            keepId: selectedAuthority.id,
            mergeIds: Array.from(selectedForMerge)
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully merged ${data.mergedCount} authorities!`);
        setMergeMode(false);
        setSelectedForMerge(new Set());
        setShowDuplicates(false);
        loadAuthorities();
      }
    } catch (error) {
      console.error('Merge authorities error:', error);
      alert('Failed to merge authorities');
    }
  };

  const filteredAuthorities = searchQuery.trim() 
    ? authorities 
    : authorities;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            🎯 Authority Manager
          </h1>
          <p className="text-gray-300">
            Professional authority control with deduplication and URI merging
          </p>
        </div>

        {/* Toolbar */}
        <div className="glass-card p-6 mb-6">
          <div className="flex gap-4 items-center flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchAuthorities()}
                  placeholder="Search authorities..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Person">Person</option>
              <option value="Organization">Organization</option>
              <option value="Topic">Topic</option>
              <option value="Place">Place</option>
              <option value="Work">Work</option>
              <option value="GenreForm">Genre/Form</option>
            </select>

            {/* Actions */}
            <button
              onClick={searchAuthorities}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              <Search className="h-4 w-4" />
              Search
            </button>

            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Authority List */}
          <div className="lg:col-span-1 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Authorities ({filteredAuthorities.length})
              </h2>
              {mergeMode && (
                <button
                  onClick={() => {
                    setMergeMode(false);
                    setSelectedForMerge(new Set());
                  }}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Cancel Merge
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredAuthorities.map((authority) => (
                  <div
                    key={authority.id}
                    onClick={() => setSelectedAuthority(authority)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedAuthority?.id === authority.id
                        ? 'bg-blue-600/30 border border-blue-500'
                        : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {mergeMode && selectedAuthority?.id !== authority.id && (
                            <input
                              type="checkbox"
                              checked={selectedForMerge.has(authority.id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedForMerge);
                                if (e.target.checked) {
                                  newSet.add(authority.id);
                                } else {
                                  newSet.delete(authority.id);
                                }
                                setSelectedForMerge(newSet);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded"
                            />
                          )}
                          <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded">
                            {authority.type}
                          </span>
                          {authority.metadata.verified && (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <div className="text-white font-semibold mb-1">
                          {authority.label}
                        </div>
                        <div className="text-xs text-gray-400">
                          Used {authority.metadata.usageCount || 0} times
                        </div>
                        {authority.externalLinks && Object.keys(authority.externalLinks).length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {authority.externalLinks.viaf && (
                              <span className="px-2 py-0.5 bg-cyan-600/30 text-cyan-300 text-xs rounded">VIAF</span>
                            )}
                            {authority.externalLinks.lc && (
                              <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 text-xs rounded">LC</span>
                            )}
                            {authority.externalLinks.wikidata && (
                              <span className="px-2 py-0.5 bg-green-600/30 text-green-300 text-xs rounded">WD</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Authority Details */}
          <div className="lg:col-span-2">
            {selectedAuthority ? (
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedAuthority.label}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded">
                          {selectedAuthority.type}
                        </span>
                        {selectedAuthority.metadata.verified && (
                          <span className="px-3 py-1 bg-green-600 text-white text-sm rounded flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Verified
                          </span>
                        )}
                        <span className="px-3 py-1 bg-slate-700 text-gray-300 text-sm rounded">
                          {selectedAuthority.metadata.source}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => findDuplicates(selectedAuthority.id)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Find Duplicates
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">URI</h3>
                      <code className="text-sm text-green-400 break-all">{selectedAuthority.uri}</code>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Usage</h3>
                      <p className="text-white">
                        Used in <strong>{selectedAuthority.metadata.usageCount || 0}</strong> records
                      </p>
                    </div>

                    {selectedAuthority.alternateLabels && selectedAuthority.alternateLabels.length > 0 && (
                      <div className="col-span-2">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Alternate Names</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedAuthority.alternateLabels.map((label, idx) => (
                            <span key={idx} className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm">
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedAuthority.externalLinks && Object.keys(selectedAuthority.externalLinks).length > 0 && (
                      <div className="col-span-2">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">External Links</h3>
                        <div className="space-y-2">
                          {selectedAuthority.externalLinks.viaf && (
                            <a
                              href={selectedAuthority.externalLinks.viaf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                            >
                              <ExternalLink className="h-4 w-4" />
                              VIAF: {selectedAuthority.externalLinks.viaf}
                            </a>
                          )}
                          {selectedAuthority.externalLinks.lc && (
                            <a
                              href={selectedAuthority.externalLinks.lc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLink className="h-4 w-4" />
                              LC: {selectedAuthority.externalLinks.lc}
                            </a>
                          )}
                          {selectedAuthority.externalLinks.wikidata && (
                            <a
                              href={selectedAuthority.externalLinks.wikidata}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-green-400 hover:text-green-300"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Wikidata: {selectedAuthority.externalLinks.wikidata}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Duplicates Panel */}
                {showDuplicates && (
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        Potential Duplicates ({duplicates.length})
                      </h3>
                      {duplicates.length > 0 && (
                        <button
                          onClick={() => setMergeMode(true)}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
                        >
                          <Merge className="h-4 w-4" />
                          Merge Mode
                        </button>
                      )}
                    </div>

                    {mergeMode && (
                      <div className="mb-4 p-4 bg-orange-600/20 border border-orange-500 rounded-lg">
                        <p className="text-orange-300 mb-2">
                          <strong>Merge Mode Active:</strong> Select duplicates to merge into "{selectedAuthority.label}"
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={mergeAuthorities}
                            disabled={selectedForMerge.size === 0}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Merge {selectedForMerge.size} Selected
                          </button>
                          <button
                            onClick={() => {
                              setMergeMode(false);
                              setSelectedForMerge(new Set());
                            }}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {duplicates.length === 0 ? (
                      <p className="text-gray-400">No duplicates found!</p>
                    ) : (
                      <div className="space-y-3">
                        {duplicates.map((dup, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-white font-semibold">
                                    {dup.authority.label}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs rounded ${
                                    dup.similarity >= 0.95 ? 'bg-red-600 text-white' :
                                    dup.similarity >= 0.85 ? 'bg-orange-600 text-white' :
                                    'bg-yellow-600 text-white'
                                  }`}>
                                    {(dup.similarity * 100).toFixed(0)}% match
                                  </span>
                                </div>
                                <div className="text-sm text-gray-400 space-y-1">
                                  {dup.reasons.map((reason, ridx) => (
                                    <div key={ridx}>• {reason}</div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-xl text-gray-400">Select an authority to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Authority Form Modal */}
        {showCreateForm && (
          <CreateAuthorityDialog
            onClose={() => setShowCreateForm(false)}
            onCreated={() => {
              setShowCreateForm(false);
              loadAuthorities();
            }}
          />
        )}
      </div>
    </div>
  );
}

function CreateAuthorityDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [formData, setFormData] = useState({
    label: '',
    type: 'Person' as Authority['type'],
    alternateLabels: '',
    viaf: '',
    lc: '',
    wikidata: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.label.trim()) {
      alert('Label is required');
      return;
    }

    setSaving(true);
    try {
      const authority: Partial<Authority> = {
        label: formData.label,
        type: formData.type,
        alternateLabels: formData.alternateLabels
          .split(',')
          .map(l => l.trim())
          .filter(l => l),
        externalLinks: {
          ...(formData.viaf && { viaf: formData.viaf }),
          ...(formData.lc && { lc: formData.lc }),
          ...(formData.wikidata && { wikidata: formData.wikidata })
        },
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          source: 'local',
          verified: false,
          usageCount: 0
        }
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/authorities`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(authority)
        }
      );

      if (response.ok) {
        onCreated();
      } else {
        throw new Error('Failed to create authority');
      }
    } catch (error) {
      console.error('Create authority error:', error);
      alert('Failed to create authority');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Authority</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Label *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Shakespeare, William"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Authority['type'] })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Person">Person</option>
              <option value="Organization">Organization</option>
              <option value="Topic">Topic</option>
              <option value="Place">Place</option>
              <option value="Work">Work</option>
              <option value="GenreForm">Genre/Form</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Alternate Names (comma-separated)
            </label>
            <input
              type="text"
              value={formData.alternateLabels}
              onChange={(e) => setFormData({ ...formData, alternateLabels: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., William Shakespeare, W. Shakespeare"
            />
          </div>

          <div className="border-t border-slate-600 pt-4">
            <h3 className="text-lg font-semibold text-white mb-4">External Links</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  VIAF URI
                </label>
                <input
                  type="text"
                  value={formData.viaf}
                  onChange={(e) => setFormData({ ...formData, viaf: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://viaf.org/viaf/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Library of Congress URI
                </label>
                <input
                  type="text"
                  value={formData.lc}
                  onChange={(e) => setFormData({ ...formData, lc: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://id.loc.gov/authorities/names/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Wikidata URI
                </label>
                <input
                  type="text"
                  value={formData.wikidata}
                  onChange={(e) => setFormData({ ...formData, wikidata: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.wikidata.org/wiki/..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Create Authority
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
