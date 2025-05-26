import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from "@/hooks/useApi";

export const DashboardStats = () => {
  const { stats, error } = useDashboardStats();

  // Fallback to mock data if API is not available
  const displayStats = stats || {
    messagesSent: 247,
    messagesReceived: 89,
    mediaFilesSent: 23,
    webhookEvents: 156,
    uptime: "2h 34m",
    lastActivity: "2 minutes ago"
  };

  if (error) {
    console.log('Dashboard stats API error:', error);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Messages Sent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{displayStats.messagesSent}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Messages Received</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{displayStats.messagesReceived}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Media Files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{displayStats.mediaFilesSent}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Webhook Events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{displayStats.webhookEvents}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Uptime</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-gray-700">{displayStats.uptime}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Last Activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="text-xs">
            {displayStats.lastActivity}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};
