import React, { useState, useEffect } from 'react';
import { useJCricket } from '../contexts/JCricketContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  GitMerge, 
  GitBranch, 
  Bell, 
  Users, 
  TrendingUp,
  Database,
  AlertCircle,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';

interface JCricketDashboardProps {
  onNavigate: (view: string) => void;
}

export function JCricketDashboard({ onNavigate }: JCricketDashboardProps) {
  const {
    userProfile,
    userRole,
    currentProvenance,
    notifications,
    reviewQueue,
    collaborationStats,
    markNotificationAsRead,
    loadNotifications,
    loadReviewQueue,
    loadCollaborationStats,
  } = useJCricket();

  useEffect(() => {
    loadNotifications();
    loadReviewQueue();
    loadCollaborationStats();
  }, []);

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const pendingReviews = reviewQueue.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            JCricket Collaborative Cataloging
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Collaborative entity management and shared cataloguing workspace
          </p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Welcome, {userProfile?.username || 'User'}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <Badge variant="outline" className="capitalize">
                    {userRole.replace('_', ' ')}
                  </Badge>
                  {currentProvenance && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      {currentProvenance.name}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="relative"
                  onClick={() => onNavigate('notifications')}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {unreadNotifications.length > 0 && (
                    <Badge className="ml-2 bg-red-600">{unreadNotifications.length}</Badge>
                  )}
                </Button>
                {(userRole === 'advanced_editor' || userRole === 'admin') && (
                  <Button
                    variant="outline"
                    onClick={() => onNavigate('review-workflow')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Review Queue
                    {pendingReviews.length > 0 && (
                      <Badge className="ml-2">{pendingReviews.length}</Badge>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        {collaborationStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  Total Clusters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{collaborationStats.totalClusters.toLocaleString()}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Entities in knowledge base
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Recent Edits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{collaborationStats.recentEdits}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  In the last 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitMerge className="h-4 w-4 text-purple-600" />
                  Merges This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{collaborationStats.mergesThisMonth}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Entity consolidations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  Active Editors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{collaborationStats.activeEditors}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Contributing this month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">
              Notifications {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
            </TabsTrigger>
            <TabsTrigger value="review-queue">
              Review Queue {pendingReviews.length > 0 && `(${pendingReviews.length})`}
            </TabsTrigger>
            <TabsTrigger value="provenance">
              Provenance Stats
            </TabsTrigger>
            <TabsTrigger value="contributors">
              Top Contributors
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Notifications
                </CardTitle>
                <CardDescription>
                  Stay updated on entity changes and review requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map(notification => (
                        <Card
                          key={notification.id}
                          className={notification.isRead ? 'opacity-60' : 'bg-blue-50 dark:bg-blue-950'}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                              {notification.title}
                              <Badge className="ml-auto capitalize">
                                {notification.type.replace(/_/g, ' ')}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {notification.message}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Queue Tab */}
          <TabsContent value="review-queue">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Pending Reviews
                </CardTitle>
                <CardDescription>
                  Merge and split operations awaiting review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {pendingReviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No pending reviews
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingReviews.map(item => (
                        <Card key={item.id} className="hover:ring-1 hover:ring-blue-600 cursor-pointer">
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                {new Date(item.requestedAt).toLocaleString()}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => onNavigate('review-workflow')}
                              >
                                Review
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Provenance Stats Tab */}
          <TabsContent value="provenance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Clusters by Provenance
                </CardTitle>
                <CardDescription>
                  Distribution of entities across contributing institutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {collaborationStats && Object.keys(collaborationStats.clustersByProvenance).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(collaborationStats.clustersByProvenance).map(([provenance, count]) => (
                        <Card key={provenance}>
                          <CardContent className="pt-4 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{provenance}</span>
                            </div>
                            <Badge variant="secondary">{count.toLocaleString()} clusters</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No provenance data available
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Contributors Tab */}
          <TabsContent value="contributors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Contributors
                </CardTitle>
                <CardDescription>
                  Most active catalogers this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {collaborationStats && collaborationStats.topContributors.length > 0 ? (
                    <div className="space-y-3">
                      {collaborationStats.topContributors.map((contributor, index) => (
                        <Card key={contributor.userId} className={index < 3 ? 'bg-yellow-50 dark:bg-yellow-950' : ''}>
                          <CardContent className="pt-4 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                index === 1 ? 'bg-gray-300 text-gray-900' :
                                index === 2 ? 'bg-orange-400 text-orange-900' :
                                'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="font-medium">{contributor.username}</span>
                            </div>
                            <Badge variant="secondary">
                              {contributor.contributionCount} contributions
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No contributor data available
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common JCricket operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="h-20 flex flex-col gap-2"
                variant="outline"
                onClick={() => onNavigate('entity-search')}
              >
                <Database className="h-6 w-6" />
                <span>Search Entities</span>
              </Button>
              <Button
                className="h-20 flex flex-col gap-2"
                variant="outline"
                onClick={() => onNavigate('entity-event-log')}
                disabled={userRole === 'basic_editor'}
              >
                <Clock className="h-6 w-6" />
                <span>Event Log</span>
              </Button>
              <Button
                className="h-20 flex flex-col gap-2"
                variant="outline"
                onClick={() => onNavigate('language-preferences')}
              >
                <Users className="h-6 w-6" />
                <span>Language Preferences</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
