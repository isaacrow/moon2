import React, { useState, useEffect } from 'react';
import { ReviewQueueItem, MergeOperation, SplitOperation } from '../types/jcricket';
import { useJCricket } from '../contexts/JCricketContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  GitMerge, 
  GitBranch, 
  User,
  FileText,
  AlertCircle
} from 'lucide-react';

interface ReviewWorkflowProps {
  onClose: () => void;
}

export function ReviewWorkflow({ onClose }: ReviewWorkflowProps) {
  const { userRole, reviewQueue, loadReviewQueue } = useJCricket();
  const { accessToken } = useAuth();
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);
  const [operationDetails, setOperationDetails] = useState<MergeOperation | SplitOperation | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadReviewQueue();
  }, []);

  const loadOperationDetails = async (item: ReviewQueueItem) => {
    setSelectedItem(item);
    try {
      const endpoint = item.operationType === 'merge' ? 'merge' : 'split';
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/jcricket/${endpoint}/${item.operationId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOperationDetails(data.operation);
      }
    } catch (error) {
      console.error('Failed to load operation details:', error);
      toast.error('Failed to load operation details');
    }
  };

  const handleApprove = async () => {
    if (!selectedItem) return;

    setIsProcessing(true);
    try {
      const endpoint = selectedItem.operationType === 'merge' ? 'merge' : 'split';
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/jcricket/${endpoint}/${selectedItem.operationId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reviewNotes,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`${selectedItem.operationType} operation approved successfully`);
        setSelectedItem(null);
        setOperationDetails(null);
        setReviewNotes('');
        loadReviewQueue();
      } else {
        toast.error(data.error || 'Failed to approve operation');
      }
    } catch (error) {
      console.error('Approve operation error:', error);
      toast.error('Failed to approve operation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    
    if (!reviewNotes.trim()) {
      toast.error('Please provide rejection notes');
      return;
    }

    setIsProcessing(true);
    try {
      const endpoint = selectedItem.operationType === 'merge' ? 'merge' : 'split';
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/jcricket/${endpoint}/${selectedItem.operationId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reviewNotes,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`${selectedItem.operationType} operation rejected`);
        setSelectedItem(null);
        setOperationDetails(null);
        setReviewNotes('');
        loadReviewQueue();
      } else {
        toast.error(data.error || 'Failed to reject operation');
      }
    } catch (error) {
      console.error('Reject operation error:', error);
      toast.error('Failed to reject operation');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingItems = reviewQueue.filter(item => item.status === 'pending');
  const inProgressItems = reviewQueue.filter(item => item.status === 'in_progress');
  const completedItems = reviewQueue.filter(item => item.status === 'completed');

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-7xl h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
              Review Workflow
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and approve/reject merge and split operations
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Left Panel: Review Queue */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Review Queue</CardTitle>
              <CardDescription>
                {pendingItems.length} pending • {inProgressItems.length} in progress • {completedItems.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <Tabs defaultValue="pending" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">
                    Pending ({pendingItems.length})
                  </TabsTrigger>
                  <TabsTrigger value="in-progress">
                    In Progress ({inProgressItems.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({completedItems.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="flex-1 overflow-hidden mt-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {pendingItems.map(item => (
                        <Card
                          key={item.id}
                          className={`cursor-pointer transition-all ${
                            selectedItem?.id === item.id
                              ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950'
                              : 'hover:ring-1 hover:ring-gray-300'
                          }`}
                          onClick={() => loadOperationDetails(item)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              {item.operationType === 'merge' ? (
                                <GitMerge className="h-4 w-4 text-blue-600" />
                              ) : (
                                <GitBranch className="h-4 w-4 text-purple-600" />
                              )}
                              {item.operationType.toUpperCase()} Operation
                              <Badge variant={item.priority === 'high' ? 'destructive' : 'default'}>
                                {item.priority}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Requested by {item.requestedByName}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              {new Date(item.requestedAt).toLocaleString()}
                            </div>
                            <div className="mt-2 text-xs">
                              {item.clusterIds.length} clusters involved
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {pendingItems.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No pending reviews
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="in-progress" className="flex-1 overflow-hidden mt-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {inProgressItems.map(item => (
                        <Card
                          key={item.id}
                          className="cursor-pointer hover:ring-1 hover:ring-gray-300"
                          onClick={() => loadOperationDetails(item)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              {item.operationType === 'merge' ? (
                                <GitMerge className="h-4 w-4 text-blue-600" />
                              ) : (
                                <GitBranch className="h-4 w-4 text-purple-600" />
                              )}
                              {item.operationType.toUpperCase()} Operation
                            </CardTitle>
                          </CardHeader>
                        </Card>
                      ))}
                      {inProgressItems.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No in-progress reviews
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="completed" className="flex-1 overflow-hidden mt-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {completedItems.map(item => (
                        <Card
                          key={item.id}
                          className="opacity-75"
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              {item.operationType === 'merge' ? (
                                <GitMerge className="h-4 w-4" />
                              ) : (
                                <GitBranch className="h-4 w-4" />
                              )}
                              {item.operationType.toUpperCase()} Operation
                              <Badge variant="secondary">Completed</Badge>
                            </CardTitle>
                          </CardHeader>
                        </Card>
                      ))}
                      {completedItems.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No completed reviews
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Right Panel: Operation Details & Review */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Operation Details</CardTitle>
              <CardDescription>
                {selectedItem 
                  ? `Review ${selectedItem.operationType} operation` 
                  : 'Select an operation to review'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {!selectedItem ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an operation from the queue to review</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {/* Request Info */}
                    <Card className="bg-gray-50 dark:bg-gray-900">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Request Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Requested by:</span>
                          <span>{selectedItem.requestedByName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Requested at:</span>
                          <span>{new Date(selectedItem.requestedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Operation ID:</span>
                          <span className="font-mono text-xs">{selectedItem.operationId}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Operation Details */}
                    {operationDetails && (
                      <Card className="bg-blue-50 dark:bg-blue-950">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">
                            {selectedItem.operationType === 'merge' ? 'Merge' : 'Split'} Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-xs overflow-x-auto p-4 bg-white dark:bg-gray-800 rounded">
                            {JSON.stringify(operationDetails, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}

                    <Separator />

                    {/* Review Actions */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Review Notes
                          {selectedItem.status === 'pending' && (
                            <span className="text-gray-500 ml-2">(Required for rejection)</span>
                          )}
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                          rows={4}
                          placeholder="Add notes about your review decision..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          disabled={isProcessing}
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleApprove}
                          disabled={isProcessing}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {isProcessing ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={handleReject}
                          disabled={isProcessing}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {isProcessing ? 'Processing...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
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
