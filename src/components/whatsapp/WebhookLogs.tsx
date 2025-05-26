
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface WebhookLog {
  id: string;
  timestamp: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  source: string;
  payload: any;
  response: any;
}

export const WebhookLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  
  // Mock data - replace with actual webhook logs from your backend
  const [logs] = useState<WebhookLog[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      method: 'POST',
      endpoint: '/webhook/whatsapp',
      status: 200,
      source: '157.240.12.35',
      payload: {
        type: 'message',
        from: '+1234567890',
        message: 'Hello, I need help with my order',
        timestamp: Date.now()
      },
      response: { success: true, processed: true }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      method: 'POST',
      endpoint: '/webhook/whatsapp',
      status: 200,
      source: '157.240.12.35',
      payload: {
        type: 'status',
        messageId: 'msg_123',
        status: 'delivered',
        timestamp: Date.now()
      },
      response: { success: true, processed: true }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      method: 'POST',
      endpoint: '/webhook/whatsapp',
      status: 500,
      source: '157.240.12.35',
      payload: {
        type: 'message',
        from: '+1987654321',
        message: 'Can you help me?',
        timestamp: Date.now()
      },
      response: { error: 'Internal server error', processed: false }
    }
  ]);

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
          Monitor incoming webhook requests from WhatsApp
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
          <Button variant="outline">Clear Logs</Button>
        </div>

        <Separator />

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No webhook logs found</p>
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
                        <span className="font-mono text-sm">{log.endpoint}</span>
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
          <p>• Webhook endpoint: <code className="bg-gray-100 px-1 rounded">/webhook/whatsapp</code></p>
          <p>• Configure your WhatsApp API to send events to this endpoint</p>
          <p>• Logs are automatically cleared after 24 hours</p>
        </div>
      </CardContent>
    </Card>
  );
};
