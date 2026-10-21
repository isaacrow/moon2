import React, { useState } from 'react';
import { EntityCluster, SplitOperation } from '../types/jcricket';
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
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Users, 
  ArrowRight
} from 'lucide-react';

interface EntitySplitProps {
  giverCluster: EntityCluster;
  receiverCluster: EntityCluster;
  onComplete: () => void;
  onCancel: () => void;
}

export function EntitySplit({ giverCluster, receiverCluster, onComplete, onCancel }: EntitySplitProps) {
  const { userRole } = useJCricket();
  const { accessToken } = useAuth();
  const [selectedProperties, setSelectedProperties] = useState<Record<string, any>>({});
  const [reviewerUsername, setReviewerUsername] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Only advanced editors can split
  if (userRole !== 'advanced_editor' && userRole !== 'admin') {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            Only Advanced Editors can perform split operations
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const toggleProperty = (key: string, value: any) => {
    setSelectedProperties(prev => {
      const newProps = { ...prev };
      if (newProps[key]) {
        delete newProps[key];
      } else {
        newProps[key] = value;
      }
      return newProps;
    });
  };

  const handleRequestReview = async () => {
    if (!reviewerUsername.trim()) {
      toast.error('Please specify a reviewer username');
      return;
    }

    if (Object.keys(selectedProperties).length === 0) {
      toast.error('Please select at least one property to move');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/jcricket/split`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            giverClusterId: giverCluster.clusterId,
            receiverClusterId: receiverCluster.clusterId,
            movedProperties: selectedProperties,
            reviewerUsername,
            notes: reviewNotes,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Split review requested successfully');
        onComplete();
      } else {
        toast.error(data.error || 'Failed to request split review');
      }
    } catch (error) {
      console.error('Split request error:', error);
      toast.error('Failed to submit split request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-purple-600" />
            Entity Split Workflow
          </CardTitle>
          <CardDescription>
            Move properties from the giver entity to the receiver entity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Entity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900">Giver</Badge>
                  <span className="truncate">{giverCluster['@id']}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {giverCluster.facets.length} facets • Status: {giverCluster.status}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Users className="h-3 w-3" />
                  {giverCluster.facets.map(f => f.provenanceName).join(', ')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900">Receiver</Badge>
                  <span className="truncate">{receiverCluster['@id']}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {receiverCluster.facets.length} facets • Status: {receiverCluster.status}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Users className="h-3 w-3" />
                  {receiverCluster.facets.map(f => f.provenanceName).join(', ')}
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Step 1: Select Properties to Move */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Select Properties to Move from Giver to Receiver
            </h3>
            <ScrollArea className="h-96 border rounded-lg p-4">
              {giverCluster.facets.map((facet, facetIdx) => (
                <Card key={facetIdx} className="mb-4 bg-orange-50 dark:bg-orange-950">
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
                        <div key={key} className="flex items-start gap-2 p-2 rounded hover:bg-white dark:hover:bg-gray-800">
                          <Checkbox
                            id={`${facet.provenanceId}-${key}`}
                            checked={!!selectedProperties[key]}
                            onCheckedChange={() => toggleProperty(key, value)}
                          />
                          <label
                            htmlFor={`${facet.provenanceId}-${key}`}
                            className="text-xs cursor-pointer flex-1"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">{key}</span>
                              {selectedProperties[key] && (
                                <ArrowRight className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                            <div className="text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                              {typeof value === 'object' ? (
                                <pre className="text-xs overflow-x-auto">
                                  {JSON.stringify(value, null, 2)}
                                </pre>
                              ) : (
                                <span>{String(value)}</span>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {Object.keys(selectedProperties).length} properties selected to move
            </div>
          </div>

          <Separator />

          {/* Step 2: Request Review */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
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
              className="bg-purple-600 hover:bg-purple-700"
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
