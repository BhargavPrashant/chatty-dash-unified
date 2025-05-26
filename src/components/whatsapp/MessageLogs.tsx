
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface MessageLog {
  id: string;
  timestamp: string;
  type: 'sent' | 'received';
  phoneNumber: string;
  content: string;
  status: 'delivered' | 'pending' | 'failed';
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}

export const MessageLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with actual data from your backend
  const [logs] = useState<MessageLog[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      type: 'sent',
      phoneNumber: '+1234567890',
      content: 'Hello! This is a test message.',
      status: 'delivered'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: 'received',
      phoneNumber: '+1987654321',
      content: 'Thanks for the information!',
      status: 'delivered'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'sent',
      phoneNumber: '+1555123456',
      content: 'Your order has been shipped.',
      status: 'delivered',
      mediaType: 'image'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      type: 'sent',
      phoneNumber: '+1444987654',
      content: 'Please confirm your appointment.',
      status: 'pending'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      type: 'sent',
      phoneNumber: '+1333456789',
      content: 'Welcome to our service!',
      status: 'failed'
    }
  ]);

  const filteredLogs = logs.filter(log =>
    log.phoneNumber.includes(searchTerm) ||
    log.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'sent' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Logs</CardTitle>
        <CardDescription>
          View all sent and received WhatsApp messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by phone number or message content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline">Export</Button>
        </div>

        <Separator />

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No messages found</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-lg border-2 ${getTypeColor(log.type)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={log.type === 'sent' ? 'default' : 'secondary'}>
                      {log.type === 'sent' ? '📤 Sent' : '📥 Received'}
                    </Badge>
                    {log.mediaType && (
                      <Badge variant="outline">
                        {log.mediaType === 'image' ? '🖼️' : 
                         log.mediaType === 'video' ? '🎥' :
                         log.mediaType === 'audio' ? '🎵' : '📄'} {log.mediaType}
                      </Badge>
                    )}
                  </div>
                  <Badge variant={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium text-sm">{log.phoneNumber}</p>
                  <p className="text-gray-700">{log.content}</p>
                  <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
