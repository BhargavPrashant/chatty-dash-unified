
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface ConnectionStatusProps {
  status: 'disconnected' | 'connecting' | 'connected';
  onStatusChange: (status: 'disconnected' | 'connecting' | 'connected') => void;
}

export const ConnectionStatus = ({ status, onStatusChange }: ConnectionStatusProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    onStatusChange('connecting');
    
    try {
      // Mock API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onStatusChange('connected');
      toast({
        title: "Connected Successfully",
        description: "WhatsApp Web session is now active",
      });
    } catch (error) {
      onStatusChange('disconnected');
      toast({
        title: "Connection Failed",
        description: "Unable to connect to WhatsApp Web",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    
    try {
      // Mock API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onStatusChange('disconnected');
      toast({
        title: "Disconnected",
        description: "WhatsApp Web session has been terminated",
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Error while disconnecting from WhatsApp Web",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
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
          <Badge variant={status === 'connected' ? 'default' : 'secondary'}>
            {getStatusText()}
          </Badge>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          {status === 'disconnected' && (
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Connecting...' : 'Connect to WhatsApp'}
            </Button>
          )}
          
          {status === 'connected' && (
            <Button 
              onClick={handleDisconnect} 
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          )}
          
          {status === 'connecting' && (
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
