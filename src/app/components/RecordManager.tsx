/**
 * RECORD MANAGER
 * UI for managing saved BIBFRAME records
 * List, open, duplicate, delete, export
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Tag, 
  Download, 
  Copy, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Plus,
  CheckCircle2,
  FileEdit,
  Package,
  X
} from 'lucide-react';
import { 
  loadAllRecords, 
  deleteRecord, 
  duplicateRecord,
  exportRecordAsJsonLd,
  exportRecordAsTurtle,
  exportRecordAsPackage,
  searchRecords,
  getRecordStatistics,
  MoonRecord
} from '../../services/recordStorageService';

interface RecordManagerProps {
  onOpenRecord: (record: MoonRecord) => void;
  onClose: () => void;
  onNewRecord: () => void;
}

export function RecordManager({ onOpenRecord, onClose, onNewRecord }: RecordManagerProps) {
  const [records, setRecords] = useState<MoonRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MoonRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [selectedRecord, setSelectedRecord] = useState<MoonRecord | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, searchQuery, filterStatus]);

  const loadRecords = () => {
    const allRecords = loadAllRecords();
    setRecords(allRecords);
    setStatistics(getRecordStatistics());
  };

  const applyFilters = () => {
    let filtered = records;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Apply search
    if (searchQuery) {
      filtered = searchRecords(searchQuery);
      if (filterStatus !== 'all') {
        filtered = filtered.filter(r => r.status === filterStatus);
      }
    }

    setFilteredRecords(filtered);
  };

  const handleDelete = (id: string) => {
    if (confirm('⚠️ Are you sure you want to delete this record?')) {
      const success = deleteRecord(id);
      if (success) {
        loadRecords();
        setSelectedRecord(null);
      }
    }
  };

  const handleDuplicate = (id: string) => {
    const duplicate = duplicateRecord(id);
    if (duplicate) {
      loadRecords();
    }
  };

  const handleExport = async (record: MoonRecord, format: 'jsonld' | 'turtle' | 'package') => {
    if (format === 'jsonld') {
      exportRecordAsJsonLd(record);
    } else if (format === 'turtle') {
      exportRecordAsTurtle(record);
    } else {
      await exportRecordAsPackage(record);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Record Manager</h2>
              <p className="text-blue-100">Manage your BIBFRAME catalog</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Statistics */}
          {statistics && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">{statistics.total}</div>
                <div className="text-sm text-blue-100">Total Records</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">{statistics.drafts}</div>
                <div className="text-sm text-blue-100">Drafts</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">{statistics.published}</div>
                <div className="text-sm text-blue-100">Published</div>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="border-b border-gray-200 p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, contributor..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Records</option>
                <option value="draft">Drafts Only</option>
                <option value="published">Published Only</option>
              </select>
              <span className="text-sm text-gray-600 ml-2">
                {filteredRecords.length} record(s)
              </span>
            </div>

            <button
              onClick={onNewRecord}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              <Plus className="h-4 w-4" />
              New Record
            </button>
          </div>
        </div>

        {/* Record List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold mb-2">No records found</p>
              <p className="text-sm">Create your first BIBFRAME record to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map(record => (
                <RecordCard
                  key={record.id}
                  record={record}
                  onOpen={() => onOpenRecord(record)}
                  onDuplicate={() => handleDuplicate(record.id)}
                  onDelete={() => handleDelete(record.id)}
                  onExport={(format) => handleExport(record, format)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecordCard({ 
  record, 
  onOpen, 
  onDuplicate, 
  onDelete, 
  onExport 
}: { 
  record: MoonRecord;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: (format: 'jsonld' | 'turtle' | 'package') => void;
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
            {record.preview.mainTitle || record.title}
          </h3>
          {record.preview.subtitle && (
            <p className="text-sm text-gray-600 line-clamp-1">{record.preview.subtitle}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
          record.status === 'published' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {record.status === 'published' ? <CheckCircle2 className="h-3 w-3 inline mr-1" /> : <FileEdit className="h-3 w-3 inline mr-1" />}
          {record.status === 'published' ? 'Published' : 'Draft'}
        </div>
      </div>

      {/* Contributors */}
      {record.preview.contributors && record.preview.contributors.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-gray-700 line-clamp-2">
            {record.preview.contributors.join('; ')}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        {record.preview.publisher && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Tag className="h-3 w-3" />
            {record.preview.publisher}
            {record.preview.year && ` • ${record.preview.year}`}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar className="h-3 w-3" />
          {new Date(record.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <FileText className="h-3 w-3" />
          Template: {record.template}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpen}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1"
        >
          <Eye className="h-4 w-4" />
          Open
        </button>
        
        <button
          onClick={onDuplicate}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
          title="Duplicate"
        >
          <Copy className="h-4 w-4" />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 min-w-[150px]">
              <button
                onClick={() => { onExport('jsonld'); setShowExportMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
              >
                📄 JSON-LD
              </button>
              <button
                onClick={() => { onExport('turtle'); setShowExportMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                🐢 Turtle
              </button>
              <button
                onClick={() => { onExport('package'); setShowExportMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Full Package
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}