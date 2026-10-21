import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  History, 
  User, 
  Calendar, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileText,
  Search
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'import';
  recordId: string;
  recordTitle: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
}

interface ActivityLogProps {
  onClose?: () => void;
}

const MOCK_ACTIVITIES: ActivityLogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    user: 'jdoe',
    action: 'update',
    recordId: '12618072',
    recordTitle: "The knitter's handy book of patterns",
    field: 'bf:subject',
    oldValue: 'Knitting',
    newValue: 'Knitting--Patterns',
    details: 'Updated subject heading to use authorized form'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    user: 'jdoe',
    action: 'create',
    recordId: '12618073',
    recordTitle: 'New bibliographic record',
    details: 'Created new Work and Instance'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    user: 'asmith',
    action: 'export',
    recordId: '12618072',
    recordTitle: "The knitter's handy book of patterns",
    details: 'Exported as JSON-LD'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    user: 'jdoe',
    action: 'import',
    recordId: '12618074',
    recordTitle: 'Imported from LOC',
    details: 'Imported from https://id.loc.gov/resources/works/12618074'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    user: 'mjohnson',
    action: 'delete',
    recordId: '12618071',
    recordTitle: 'Deleted record',
    details: 'Record marked as deleted'
  },
];

const ACTION_ICONS = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  export: Download,
  import: FileText,
};

const ACTION_COLORS = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  view: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  export: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  import: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
};

export function ActivityLog({ onClose }: ActivityLogProps) {
  const { t } = useTranslation();
  const [activities] = useState<ActivityLogEntry[]>(MOCK_ACTIVITIES);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = activities.filter(activity => {
    const matchesAction = filterAction === 'all' || activity.action === filterAction;
    const matchesUser = filterUser === 'all' || activity.user === filterUser;
    const matchesSearch = !searchQuery || 
      activity.recordTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.recordId.includes(searchQuery) ||
      activity.details?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesAction && matchesUser && matchesSearch;
  });

  const uniqueUsers = Array.from(new Set(activities.map(a => a.user)));

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleString();
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Record ID', 'Title', 'Details'].join(','),
      ...filteredActivities.map(a => 
        [
          a.timestamp.toISOString(),
          a.user,
          a.action,
          a.recordId,
          `"${a.recordTitle}"`,
          `"${a.details || ''}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Activity Log
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track all actions and changes across BIBFRAME records
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Log
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, ID, or details..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Action Type</label>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                      <SelectItem value="import">Import</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">User</label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {uniqueUsers.map(user => (
                        <SelectItem key={user} value={user}>
                          {user}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredActivities.length} of {activities.length} activities
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredActivities.map((activity, index) => {
                    const Icon = ACTION_ICONS[activity.action];
                    return (
                      <div key={activity.id}>
                        <div className="flex gap-4">
                          {/* Timeline marker */}
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ACTION_COLORS[activity.action]}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            {index < filteredActivities.length - 1 && (
                              <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 min-h-[40px]" />
                            )}
                          </div>

                          {/* Activity details */}
                          <div className="flex-1 pb-8">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="capitalize">
                                    {activity.action}
                                  </Badge>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    by
                                  </span>
                                  <Badge variant="secondary" className="gap-1">
                                    <User className="h-3 w-3" />
                                    {activity.user}
                                  </Badge>
                                </div>
                                <h3 className="font-semibold mt-2 text-gray-900 dark:text-white">
                                  {activity.recordTitle}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                  Record ID: {activity.recordId}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="h-4 w-4" />
                                {formatTimestamp(activity.timestamp)}
                              </div>
                            </div>

                            {activity.field && (
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                                <div className="font-medium mb-1">Field: {activity.field}</div>
                                {activity.oldValue && (
                                  <div className="text-red-600 dark:text-red-400">
                                    - {activity.oldValue}
                                  </div>
                                )}
                                {activity.newValue && (
                                  <div className="text-green-600 dark:text-green-400">
                                    + {activity.newValue}
                                  </div>
                                )}
                              </div>
                            )}

                            {activity.details && (
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {activity.details}
                              </p>
                            )}
                          </div>
                        </div>
                        {index < filteredActivities.length - 1 && <Separator className="my-0" />}
                      </div>
                    );
                  })}

                  {filteredActivities.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activities found matching your filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
