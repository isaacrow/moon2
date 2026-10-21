import React, { useState, useEffect } from 'react';
import { EntityCluster, MergeOperation } from '../types/jcricket';
import { useJCricket } from '../contexts/JCricketContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { 
  GitMerge, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Users, 
  ArrowRight,
  Trash2
} from 'lucide-react';

interface EntityMergeProps {
  selectedClusters: EntityCluster[];
  onComplete: () => void;
  onCancel: () => void;
}

export function EntityMerge({ selectedClusters, onComplete, onCancel }: EntityMergeProps) {
  const { userRole, currentProvenance } = useJCricket();
  const { accessToken } = useAuth();
  const [destinationIndex, setDestinationIndex] = useState<number>(0);
  const [selectedProperties, setSelectedProperties] = useState<Record<string, any>>({});
  const [reviewerUsername, setReviewerUsername] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Only advanced editors can merge
  if (userRole !== 'advanced_editor' && userRole !== 'admin') {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            Only Advanced Editors can perform merge operations
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Need at least 2 clusters to merge
  if (selectedClusters.length < 2) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            Insufficient Selection
          </CardTitle>
          <CardDescription>
            Please select at least 2 entities to merge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onCancel} variant="outline">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const destinationCluster = selectedClusters[destinationIndex];
  const sourceClusters = selectedClusters.filter((_, idx) => idx !== destinationIndex);

  const toggleProperty = (source: string, key: string, value: any) => {
    const propertyKey = `${source}:${key}`;
    setSelectedProperties(prev => {
      const newProps = { ...prev };
      if (newProps[propertyKey]) {
        delete newProps[propertyKey];
      } else {
        newProps[propertyKey] = { key, value, source };
      }
      return newProps;
    });
  };

  const handleRequestReview = async () => {
    if (!reviewerUsername.trim()) {
      toast.error('Please specify a reviewer username');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/jcricket/merge`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destinationClusterId: destinationCluster.clusterId,
            sourceClusterIds: sourceClusters.map(c => c.clusterId),
            selectedProperties,
            reviewerUsername,
            notes: reviewNotes,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Merge review requested successfully');
        onComplete();
      } else {
        toast.error(data.error || 'Failed to request merge review');
      }
    } catch (error) {
      console.error('Merge request error:', error);
      toast.error('Failed to submit merge request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-6 w-6 text-blue-600" />
            Entity Merge Workflow
          </CardTitle>
          <CardDescription>
            Merge {selectedClusters.length} entities into one. Select the destination entity and choose properties to merge.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Select Destination */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Select Merge Destination
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedClusters.map((cluster, idx) => (
                <Card
                  key={cluster.clusterId}
                  className={`cursor-pointer transition-all ${
                    idx === destinationIndex 
                      ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950' 
                      : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                  onClick={() => setDestinationIndex(idx)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="truncate">{cluster['@id']}</span>
                      {idx === destinationIndex && (
                        <Badge variant="default">Destination</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {cluster.facets.length} facets • Status: {cluster.status}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Users className="h-3 w-3" />
                      {cluster.facets.map(f => f.provenanceName).join(', ')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Step 2: Select Properties to Merge */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Select Properties to Copy to Destination
            </h3>
            <ScrollArea className="h-96 border rounded-lg p-4">
              {sourceClusters.map((sourceCluster, sourceIdx) => (
                <div key={sourceCluster.clusterId} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">Source {sourceIdx + 1}</Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium truncate">{sourceCluster['@id']}</span>
                  </div>
                  
                  {sourceCluster.facets.map((facet, facetIdx) => (
                    <Card key={facetIdx} className="mb-3 bg-gray-50 dark:bg-gray-900">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          {facet.provenanceName}
                          {facet.isLeader && <Badge variant="secondary" className="text-xs">Leader</Badge>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(facet.properties).map(([key, value]) => (
                            <div key={key} className="flex items-start gap-2">
                              <Checkbox
                                id={`${sourceCluster.clusterId}-${facet.provenanceId}-${key}`}
                                checked={!!selectedProperties[`${sourceCluster.clusterId}:${key}`]}
                                onCheckedChange={() => 
                                  toggleProperty(sourceCluster.clusterId, key, value)
                                }
                              />
                              <label
                                htmlFor={`${sourceCluster.clusterId}-${facet.provenanceId}-${key}`}
                                className="text-xs cursor-pointer flex-1"
                              >
                                <span className="font-mono text-blue-600 dark:text-blue-400">{key}:</span>{' '}
                                <span className="text-gray-700 dark:text-gray-300">
                                  {JSON.stringify(value, null, 2)}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </ScrollArea>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {Object.keys(selectedProperties).length} properties selected for merge
            </div>
          </div>

          <Separator />

          {/* Step 3: Request Review */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Request Review
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Reviewer Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Enter reviewer's username"
                  value={reviewerUsername}
                  onChange={(e) => setReviewerUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Notes (optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  rows={3}
                  placeholder="Add any notes for the reviewer..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestReview}
              disabled={isProcessing || Object.keys(selectedProperties).length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Request Review'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
