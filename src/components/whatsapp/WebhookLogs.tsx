
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useApiCall } from "@/hooks/useApi";
import { webhookApi, WebhookLog } from "@/services/api";

export const WebhookLogs = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  
  const { loading: isLoading, execute: executeLoadLogs } = useApiCall();
  const { loading: isClearing, execute: executeClearLogs } = useApiCall();

  // Load webhook logs
  const loadLogs = async () => {
    await executeLoadLogs(async () => {
      const response = await webhookApi.getLogs(100, 0);
      if (response.success && response.data) {
        setLogs(response.data);
      }
      return response;
    });
  };

  // Clear webhook logs
  const clearLogs = async () => {
    await executeClearLogs(async () => {
      const response = await webhookApi.clearLogs();
      if (response.success) {
        setLogs([]);
        toast({
          title: "Logs Cleared",
          description: "All webhook logs have been cleared",
        });
      }
      return response;
    });
  };

  useEffect(() => {
    loadLogs();
    
    // Auto-refresh logs every 10 seconds
    const interval = setInterval(loadLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log =>
    log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.source.includes(searchTerm) ||
    JSON.stringify(log.payload).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'default';
    if (status >= 400 && status < 500) return 'secondary';
    if (status >= 500) return 'destructive';
    return 'outline';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'POST': return 'bg-green-100 text-green-800';
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Logs</CardTitle>
        <CardDescription>
          Monitor webhook requests sent to your configured endpoint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by endpoint, source, or payload..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            onClick={clearLogs}
            disabled={isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear Logs'}
          </Button>
          <Button 
            variant="outline" 
            onClick={loadLogs}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <Separator />

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading && logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Loading webhook logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No webhook logs found</p>
              <p className="text-xs mt-2">Configure a webhook URL to start receiving notifications</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <Collapsible key={log.id}>
                <div className="p-4 rounded-lg border">
                  <CollapsibleTrigger
                    className="w-full"
                    onClick={() => toggleExpanded(log.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getMethodColor(log.method)}>
                          {log.method}
                        </Badge>
                        <span className="font-mono text-sm truncate max-w-xs">{log.endpoint}</span>
                        <Badge variant={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between text-left">
                      <span className="text-sm text-gray-600">
                        Source: {log.source}
                      </span>
                      <span className="text-xs text-gray-400">
                        {expandedLogs.has(log.id) ? 'Click to collapse' : 'Click to expand'}
                      </span>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <Separator className="my-3" />
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Request Payload:</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Response:</h4>
                        <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          )}
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Webhook logs show requests sent to your configured endpoint</p>
          <p>• Configure your webhook URL in the "Webhook Config" tab</p>
          <p>• Logs are automatically cleared after 24 hours to save space</p>
        </div>
      </CardContent>
    </Card>
  );
};
