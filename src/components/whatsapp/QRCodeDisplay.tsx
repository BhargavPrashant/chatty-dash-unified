
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDisplayProps {
  qrCode: string;
  onQrCodeChange: (qrCode: string) => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

export const QRCodeDisplay = ({ qrCode, onQrCodeChange, connectionStatus }: QRCodeDisplayProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    try {
      // Mock QR code generation - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock QR code data URL (in reality, this would come from your backend)
      const mockQRCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAADl0RVh0U29mdHdhcmUAbWF0cGxvdGxpYiB2ZXJzaW9uIDMuMC4yLCBodHRwOi8vbWF0cGxvdGxpYi5vcmcvOIA7rQAAIABJREFUeJzs3Xl8VPW5+PHPmZksJCEJSYAkJCGEfQ8gsgiKgijuVeu+1dpqW2+7Xbe299Z67dL2V1vb29p6tba21rVSrXvdUBEVEGVfwh4gCZCQkASyTjJz5vf7Y04mEZYsJJlJeN6v17zOOd/znTnPnMn5nu8u3nvvPQaAmE8CgmfMBUIQO23/wjQQBFGTTRoJKiXZm8cC2AJsaq5peGV1e/trwPaGWFt7INgShT4fV27PEQnzrb3k7J6zbOKoQf3a6wOcPHzYQAb0i1P8nPEGQRf6SJQAX3TA/cD6xlvvPTEQbU2VfAIKj8Sj8Eh0XcZumfZqe7qlOrJzVoOF5JKCKUCBz4sP+rnG6Q3tZe8O93o1XSgJZQ0f9TuvfgQfTOsK/R9BBsH3Mc01wYiTrGHTFgE5l9BK3xqEPrFCqQ8/tQEo5P8NG3+F/ZGwEqAKDyOWXq7H+wJ3/RsBY4AZgHPgzw8E8RAwNOFPqmXGb+8VB+BK5YcvPY8bxWA1Mw1WArAeERqJR+EROA4f7GWpDwSDaQ6xzsBsM8FJ8kv/LhJ8AKSI4qN4FBGPwqOICLJ+g6i1vVXM9XyJ+kE2aIj4KD6KR+EROA4bpKvgIuKj+CgehUfgOAgyCLo8JFbAyJYgM8RH8VE8Co/AcRBkEHR5SKyACNV/kiBgEH8/L4z/A1wBgKkKS8VUAAAAAElFTkSuQmCC";
      onQrCodeChange(mockQRCode);
      
      toast({
        title: "QR Code Generated",
        description: "Scan with your WhatsApp mobile app to connect",
      });
    } catch (error) {
      toast({
        title: "QR Code Generation Failed",
        description: "Unable to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (connectionStatus === 'connecting' && !qrCode) {
      generateQRCode();
    }
  }, [connectionStatus]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Scanner</CardTitle>
        <CardDescription>
          Scan this QR code with your WhatsApp mobile app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {connectionStatus === 'connected' ? (
            <div className="w-64 h-64 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-green-600 text-2xl">✓</div>
                <p className="text-green-700 font-medium">Connected Successfully</p>
                <p className="text-sm text-green-600">Session is active</p>
              </div>
            </div>
          ) : qrCode ? (
            <div className="w-64 h-64 border-2 border-gray-200 rounded-lg overflow-hidden">
              <img 
                src={qrCode} 
                alt="WhatsApp QR Code" 
                className="w-full h-full object-contain"
              />
            </div>
          ) : isGenerating ? (
            <Skeleton className="w-64 h-64 rounded-lg" />
          ) : (
            <div className="w-64 h-64 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-gray-400 text-2xl">📱</div>
                <p className="text-gray-500">No QR Code</p>
                <p className="text-sm text-gray-400">Connect to generate QR code</p>
              </div>
            </div>
          )}
          
          {connectionStatus !== 'connected' && (
            <Button 
              onClick={generateQRCode}
              disabled={isGenerating || connectionStatus === 'connecting'}
              variant="outline"
            >
              {isGenerating ? 'Generating...' : 'Generate New QR Code'}
            </Button>
          )}
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>1. Open WhatsApp on your phone</p>
          <p>2. Tap Menu or Settings and select Linked Devices</p>
          <p>3. Point your phone at this screen to capture the code</p>
        </div>
      </CardContent>
    </Card>
  );
};
