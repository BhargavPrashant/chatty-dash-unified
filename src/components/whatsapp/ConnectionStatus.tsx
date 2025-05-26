import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useApiCall, useConnectionStatus } from "@/hooks/useApi";
import { connectionApi } from "@/services/api";

interface ConnectionStatusProps {
  status: 'disconnected' | 'connecting' | 'connected';
  onStatusChange: (status: 'disconnected' | 'connecting' | 'connected') => void;
}

export const ConnectionStatus = ({ status, onStatusChange }: ConnectionStatusProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { execute: executeConnect } = useApiCall();
  const { execute: executeDisconnect } = useApiCall();

  // Use real-time connection status if available
  const { status: realTimeStatus } = useConnectionStatus();
  const currentStatus = realTimeStatus || status;

  const handleConnect = async () => {
    setIsLoading(true);
    onStatusChange('connecting');
    
    await executeConnect(async () => {
      const response = await connectionApi.connect();
      if (response.success) {
        onStatusChange('connected');
        toast({
          title: "Connected Successfully",
          description: "WhatsApp Web session is now active",
        });
      } else {
        onStatusChange('disconnected');
        toast({
          title: "Connection Failed",
          description: response.error || "Unable to connect to WhatsApp Web",
          variant: "destructive",
        });
      }
      return response;
    });
    
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    
    await executeDisconnect(async () => {
      const response = await connectionApi.disconnect();
      if (response.success) {
        onStatusChange('disconnected');
        toast({
          title: "Disconnected",
          description: "WhatsApp Web session has been terminated",
        });
      } else {
        toast({
          title: "Disconnection Failed",
          description: response.error || "Error while disconnecting from WhatsApp Web",
          variant: "destructive",
        });
      }
      return response;
    });
    
    setIsLoading(false);
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          Connection Status
        </CardTitle>
        <CardDescription>
          Manage your WhatsApp Web connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Status:</span>
          <Badge variant={currentStatus === 'connected' ? 'default' : 'secondary'}>
            {getStatusText()}
          </Badge>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          {currentStatus === 'disconnected' && (
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Connecting...' : 'Connect to WhatsApp'}
            </Button>
          )}
          
          {currentStatus === 'connected' && (
            <Button 
              onClick={handleDisconnect} 
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          )}
          
          {currentStatus === 'connecting' && (
            <Button disabled className="w-full">
              Establishing Connection...
            </Button>
          )}
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Scan QR code with your WhatsApp mobile app</p>
          <p>• Keep your phone connected to the internet</p>
          <p>• Session will remain active for 24 hours</p>
        </div>
      </CardContent>
    </Card>
  );
};
