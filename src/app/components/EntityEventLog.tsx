import React, { useState, useEffect } from 'react';
import { EntityEventLog as EventLogEntry } from '../types/jcricket';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  History, 
  Plus, 
  Edit, 
  Trash2, 
  GitMerge, 
  GitBranch, 
  CheckCircle2, 
  XCircle,
  User,
  Clock,
  Building,
  Filter
} from 'lucide-react';

interface EntityEventLogProps {
  clusterId?: string;
  onClose: () => void;
}

const eventTypeIcons = {
  create: Plus,
  edit: Edit,
  merge: GitMerge,
  split: GitBranch,
  invalidate: Trash2,
  review_approve: CheckCircle2,
  review_reject: XCircle,
  property_add: Plus,
  property_update: Edit,
  property_delete: Trash2,
};

const eventTypeColors = {
  create: 'text-green-600',
  edit: 'text-blue-600',
  merge: 'text-purple-600',
  split: 'text-orange-600',
  invalidate: 'text-red-600',
  review_approve: 'text-green-600',
  review_reject: 'text-red-600',
  property_add: 'text-green-600',
  property_update: 'text-blue-600',
  property_delete: 'text-red-600',
};

export function EntityEventLog({ clusterId, onClose }: EntityEventLogProps) {
  const { accessToken } = useAuth();
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<EventLogEntry | null>(null);

  useEffect(() => {
    loadEventLog();
  }, [clusterId]);

  useEffect(() => {
    applyFilters();
  }, [events, searchQuery, eventTypeFilter, userFilter]);

  const loadEventLog = async () => {
    setIsLoading(true);
    try {
      const url = clusterId
        ? `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/jcricket/events?clusterId=${clusterId}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/jcricket/events`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to load event log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.description.toLowerCase().includes(query) ||
        event.username.toLowerCase().includes(query) ||
        event.clusterId.toLowerCase().includes(query)
      );
    }

    // Event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(event => event.userId === userFilter);
    }

    setFilteredEvents(filtered);
  };

  const uniqueUsers = Array.from(new Set(events.map(e => e.userId))).map(userId => {
    const event = events.find(e => e.userId === userId);
    return { userId, username: event?.username || userId };
  });

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-7xl h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <History className="h-8 w-8 text-blue-600" />
              Entity Event Log
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {clusterId 
                ? `Complete history for cluster: ${clusterId}` 
                : 'Complete history of all entity changes'}
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Event Type</label>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="merge">Merge</SelectItem>
                    <SelectItem value="split">Split</SelectItem>
                    <SelectItem value="invalidate">Invalidate</SelectItem>
                    <SelectItem value="review_approve">Review Approve</SelectItem>
                    <SelectItem value="review_reject">Review Reject</SelectItem>
                    <SelectItem value="property_add">Property Add</SelectItem>
                    <SelectItem value="property_update">Property Update</SelectItem>
                    <SelectItem value="property_delete">Property Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">User</label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user.userId} value={user.userId}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Log */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Left Panel: Event List */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Event Timeline</CardTitle>
              <CardDescription>
                {filteredEvents.length} events {searchQuery || eventTypeFilter !== 'all' || userFilter !== 'all' ? '(filtered)' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading events...</div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No events found</div>
                ) : (
                  <div className="space-y-3">
                    {filteredEvents.map((event, index) => {
                      const Icon = eventTypeIcons[event.eventType];
                      const colorClass = eventTypeColors[event.eventType];
                      
                      return (
                        <Card
                          key={event.id}
                          className={`cursor-pointer transition-all ${
                            selectedEvent?.id === event.id
                              ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950'
                              : 'hover:ring-1 hover:ring-gray-300'
                          }`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${colorClass}`} />
                              <Badge variant="outline" className="capitalize">
                                {event.eventType.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-gray-500 ml-auto">
                                #{filteredEvents.length - index}
                              </span>
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {event.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <User className="h-3 w-3" />
                              {event.username}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Building className="h-3 w-3" />
                              {event.provenanceName}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Panel: Event Details */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                {selectedEvent ? 'Detailed information about the selected event' : 'Select an event to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {!selectedEvent ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an event to view detailed information</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {/* Event Info */}
                    <Card className="bg-gray-50 dark:bg-gray-900">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Event Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Event ID:</span>
                          <div className="font-mono text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {selectedEvent.id}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Cluster ID:</span>
                          <div className="font-mono text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {selectedEvent.clusterId}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <div className="mt-1">
                            <Badge className="capitalize">
                              {selectedEvent.eventType.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Description:</span>
                          <div className="text-gray-700 dark:text-gray-300 mt-1">
                            {selectedEvent.description}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">User:</span>
                          <div className="mt-1">{selectedEvent.username}</div>
                        </div>
                        <div>
                          <span className="font-medium">Provenance:</span>
                          <div className="mt-1">{selectedEvent.provenanceName}</div>
                        </div>
                        <div>
                          <span className="font-medium">Timestamp:</span>
                          <div className="mt-1">
                            {new Date(selectedEvent.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Changes */}
                    {selectedEvent.changes && selectedEvent.changes.length > 0 && (
                      <Card className="bg-blue-50 dark:bg-blue-950">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Changes ({selectedEvent.changes.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedEvent.changes.map((change, idx) => (
                              <Card key={idx} className="bg-white dark:bg-gray-800">
                                <CardContent className="pt-4">
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="font-medium">Field:</span>
                                      <span className="ml-2 font-mono text-blue-600 dark:text-blue-400">
                                        {change.field}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Action:</span>
                                      <Badge className="ml-2 capitalize" variant={
                                        change.action === 'add' ? 'default' :
                                        change.action === 'update' ? 'secondary' :
                                        'destructive'
                                      }>
                                        {change.action}
                                      </Badge>
                                    </div>
                                    {change.oldValue !== undefined && (
                                      <div>
                                        <span className="font-medium">Old Value:</span>
                                        <pre className="mt-1 p-2 bg-red-50 dark:bg-red-950 rounded text-xs overflow-x-auto">
                                          {JSON.stringify(change.oldValue, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    {change.newValue !== undefined && (
                                      <div>
                                        <span className="font-medium">New Value:</span>
                                        <pre className="mt-1 p-2 bg-green-50 dark:bg-green-950 rounded text-xs overflow-x-auto">
                                          {JSON.stringify(change.newValue, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Metadata */}
                    {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                      <Card className="bg-gray-50 dark:bg-gray-900">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Additional Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-xs overflow-x-auto p-4 bg-white dark:bg-gray-800 rounded">
                            {JSON.stringify(selectedEvent.metadata, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
