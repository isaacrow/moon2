/**
 * 📚 Records Dashboard
 * Browse, search, and manage BIBFRAME records
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit, Archive, CheckCircle2, Clock, BookOpen, Eye } from 'lucide-react';
import { listRecords, searchRecords, RecordMetadata, downloadExport, deleteRecord } from '../../services/recordPersistence';

interface RecordsDashboardProps {
  onEdit?: (recordId: string) => void;
  onCreateNew?: () => void;
}

export default function RecordsDashboard({ onEdit, onCreateNew }: RecordsDashboardProps) {
  const [records, setRecords] = useState<RecordMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    loadRecords();
  }, [filterStatus, filterType]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await listRecords({
        status: filterStatus || undefined,
        resourceType: filterType || undefined,
        limit: 100
      });
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadRecords();
      return;
    }

    try {
      setLoading(true);
      const results = await searchRecords(searchQuery);
      setRecords(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('Archive this record?')) return;

    try {
      await deleteRecord(recordId);
      loadRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      alert('Failed to archive record');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-yellow-100 text-yellow-800',
      validated: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-600'
    };
    
    const icons = {
      draft: <Clock className="h-3 w-3" />,
      validated: <CheckCircle2 className="h-3 w-3" />,
      published: <CheckCircle2 className="h-3 w-3" />,
      archived: <Archive className="h-3 w-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges] || badges.draft}`}>
        {icons[status as keyof typeof icons] || icons.draft}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                BIBFRAME Records
              </h1>
              <p className="text-gray-600">Manage your cataloging records</p>
            </div>
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md"
              >
                <Plus className="h-5 w-5" />
                New Record
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search records by title or ID..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
            >
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="validated">Validated</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Work">Work</option>
              <option value="Instance">Instance</option>
              <option value="Item">Item</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              Loading records...
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold">No records found</p>
              <p className="text-sm mt-2">Create your first BIBFRAME record to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{record.title}</div>
                        <div className="text-xs text-gray-500 font-mono">{record.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        {record.resourceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                      v{record.versionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(record.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(record.id)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={() => downloadExport(record.id, 'jsonld', record.title)}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
                          title="Export JSON-LD"
                        >
                          <Download className="h-4 w-4 text-gray-600 group-hover:text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats */}
        {!loading && records.length > 0 && (
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{records.length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {records.filter(r => r.status === 'draft').length}
              </div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {records.filter(r => r.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-600">
                {records.filter(r => r.status === 'archived').length}
              </div>
              <div className="text-sm text-gray-600">Archived</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
