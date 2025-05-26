
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSender } from "@/components/whatsapp/MessageSender";
import { MediaUploader } from "@/components/whatsapp/MediaUploader";
import { MessageLogs } from "@/components/whatsapp/MessageLogs";
import { ConnectionStatus } from "@/components/whatsapp/ConnectionStatus";
import { QRCodeDisplay } from "@/components/whatsapp/QRCodeDisplay";
import { WebhookLogs } from "@/components/whatsapp/WebhookLogs";
import { DashboardStats } from "@/components/whatsapp/DashboardStats";

const Index = () => {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">WhatsApp Web Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your WhatsApp Web automation and messaging</p>
          <div className="flex justify-center">
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'} className="text-sm">
              Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Connection Status and QR Code Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConnectionStatus 
            status={connectionStatus} 
            onStatusChange={setConnectionStatus}
          />
          <QRCodeDisplay 
            qrCode={qrCode}
            onQrCodeChange={setQrCode}
            connectionStatus={connectionStatus}
          />
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="messaging" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="messaging">Send Messages</TabsTrigger>
            <TabsTrigger value="media">Media Upload</TabsTrigger>
            <TabsTrigger value="logs">Message Logs</TabsTrigger>
            <TabsTrigger value="webhook">Webhook Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="messaging" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send WhatsApp Message</CardTitle>
                <CardDescription>
                  Send messages to WhatsApp contacts through the connected session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MessageSender connectionStatus={connectionStatus} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Media Files</CardTitle>
                <CardDescription>
                  Upload and send images, documents, and other media files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MediaUploader connectionStatus={connectionStatus} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <MessageLogs />
          </TabsContent>

          <TabsContent value="webhook" className="space-y-6">
            <WebhookLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
