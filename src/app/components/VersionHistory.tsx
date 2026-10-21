/**
 * 🕰️ VERSION HISTORY VIEWER
 * View, compare, and rollback versions of records and authorities
 */

import React, { useState, useEffect } from 'react';
import { History, RotateCcw, Eye, GitCompare, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Version {
  id: string;
  entityId: string;
  entityType: 'record' | 'authority';
  version: number;
  data: any;
  metadata: {
    createdAt: string;
    createdBy: string;
    action: 'create' | 'update' | 'delete' | 'merge';
    changeDescription?: string;
    parentVersion?: number;
  };
  namedGraphUri?: string;
}

export function VersionHistory({ entityId, entityType }: {
  entityId: string;
  entityType: 'record' | 'authority';
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [compareVersion, setCompareVersion] = useState<Version | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);

  useEffect(() => {
    loadVersionHistory();
  }, [entityId, entityType]);

  const loadVersionHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/versions/${entityType}/${entityId}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVersions(data.history || []);
        if (data.history && data.history.length > 0) {
          setSelectedVersion(data.history[0]);
        }
      }
    } catch (error) {
      console.error('Load version history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const rollback = async (targetVersion: number, reason: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/versions/${entityType}/${entityId}/rollback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            targetVersion,
            actor: 'current-user', // Replace with actual user
            reason
          })
        }
      );

      if (response.ok) {
        alert('Rollback successful!');
        loadVersionHistory();
        setShowRollbackDialog(false);
      } else {
        const error = await response.json();
        alert(`Rollback failed: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('Rollback error:', error);
      alert('Rollback failed');
    }
  };

  const softDelete = async (reason: string) => {
    if (!confirm('Are you sure you want to soft delete this entity?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/${entityType}/${entityId}/delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            actor: 'current-user',
            reason
          })
        }
      );

      if (response.ok) {
        alert('Entity soft deleted successfully');
        loadVersionHistory();
      }
    } catch (error) {
      console.error('Soft delete error:', error);
      alert('Delete failed');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading version history...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Version Timeline */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <History className="h-6 w-6" />
          Version History ({versions.length} versions)
        </h2>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {versions.map((version) => (
            <div
              key={version.id}
              onClick={() => setSelectedVersion(version)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedVersion?.id === version.id
                  ? 'bg-blue-600/30 border border-blue-500'
                  : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-600 text-white text-sm rounded font-mono">
                      v{version.version}
                    </span>
                    <span className={`px-2 py-1 text-white text-sm rounded ${
                      version.metadata.action === 'create' ? 'bg-green-600' :
                      version.metadata.action === 'update' ? 'bg-blue-600' :
                      version.metadata.action === 'delete' ? 'bg-red-600' :
                      'bg-orange-600'
                    }`}>
                      {version.metadata.action}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    {version.metadata.changeDescription || 'No description'}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(version.metadata.createdAt).toLocaleString()} • {version.metadata.createdBy}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCompareVersion(version);
                    }}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm flex items-center gap-1"
                  >
                    <GitCompare className="h-4 w-4" />
                    Compare
                  </button>
                  {version.version !== versions[0].version && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRollbackDialog(true);
                      }}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm flex items-center gap-1"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Rollback
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Version Details */}
      {selectedVersion && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">
              Version {selectedVersion.version} Details
            </h3>
            {selectedVersion.data._deleted && (
              <span className="px-3 py-1 bg-red-600 text-white rounded flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                DELETED
              </span>
            )}
          </div>

          <pre className="p-4 bg-slate-900 rounded-lg text-green-400 text-sm overflow-auto max-h-[500px]">
            {JSON.stringify(selectedVersion.data, null, 2)}
          </pre>

          {selectedVersion.namedGraphUri && (
            <div className="mt-4 p-4 bg-blue-600/20 border border-blue-500 rounded-lg">
              <div className="text-sm font-semibold text-blue-300 mb-1">Named Graph URI:</div>
              <code className="text-blue-400 text-sm">{selectedVersion.namedGraphUri}</code>
            </div>
          )}
        </div>
      )}

      {/* Compare View */}
      {compareVersion && selectedVersion && compareVersion.id !== selectedVersion.id && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Comparing v{compareVersion.version} vs v{selectedVersion.version}
            </h3>
            <button
              onClick={() => setCompareVersion(null)}
              className="text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-400 mb-2">
                Version {compareVersion.version}
              </div>
              <pre className="p-4 bg-slate-900 rounded-lg text-green-400 text-xs overflow-auto max-h-[400px]">
                {JSON.stringify(compareVersion.data, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-400 mb-2">
                Version {selectedVersion.version}
              </div>
              <pre className="p-4 bg-slate-900 rounded-lg text-green-400 text-xs overflow-auto max-h-[400px]">
                {JSON.stringify(selectedVersion.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Dialog */}
      {showRollbackDialog && selectedVersion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">Rollback to Version {selectedVersion.version}</h3>
            </div>

            <p className="text-gray-300 mb-4">
              This will create a new version with the data from version {selectedVersion.version}.
              The current data will be preserved in version history.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Reason for rollback *
              </label>
              <textarea
                id="rollback-reason"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="Explain why you're rolling back..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const reason = (document.getElementById('rollback-reason') as HTMLTextAreaElement).value;
                  if (!reason.trim()) {
                    alert('Reason is required');
                    return;
                  }
                  rollback(selectedVersion.version, reason);
                }}
                className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold"
              >
                Confirm Rollback
              </button>
              <button
                onClick={() => setShowRollbackDialog(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
