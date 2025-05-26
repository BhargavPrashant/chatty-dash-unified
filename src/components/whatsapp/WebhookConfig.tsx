
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, ExternalLink, Webhook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApiCall } from "@/hooks/useApi";
import { webhookApi } from "@/services/api";

export const WebhookConfig = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [currentWebhookInfo, setCurrentWebhookInfo] = useState({ endpoint: '', status: 'inactive' });
  
  const { loading: isConfiguring, execute: executeConfigureWebhook } = useApiCall();
  const { loading: isTesting, execute: executeTestWebhook } = useApiCall();
  
  // Load current webhook configuration
  useEffect(() => {
    const loadWebhookInfo = async () => {
      try {
        const response = await webhookApi.getEndpointInfo();
        if (response.success && response.data) {
          setCurrentWebhookInfo(response.data);
          setWebhookUrl(response.data.endpoint);
        }
      } catch (error) {
        console.error('Failed to load webhook info:', error);
      }
    };
    
    loadWebhookInfo();
  }, []);
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const configureWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      });
      return;
    }

    await executeConfigureWebhook(async () => {
      const response = await fetch('/api/webhook/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl: webhookUrl.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentWebhookInfo({ endpoint: webhookUrl.trim(), status: 'active' });
        toast({
          title: "Webhook Configured",
          description: "Webhook URL configured successfully",
        });
      } else {
        throw new Error(data.error || 'Failed to configure webhook');
      }

      return data;
    });
  };

  const testWebhook = async () => {
    await executeTestWebhook(async () => {
      const response = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Webhook Test Sent",
          description: "Test webhook event sent successfully",
        });
      } else {
        throw new Error(data.error || 'Webhook test failed');
      }

      return data;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Configuration
        </CardTitle>
        <CardDescription>
          Configure webhook URL to receive real-time WhatsApp message notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configure Webhook URL */}
        <div className="space-y-2">
          <Label>Your Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-domain.com/webhook/whatsapp"
              className="font-mono text-sm"
            />
            <Button
              onClick={configureWebhook}
              disabled={isConfiguring}
              size="sm"
            >
              {isConfiguring ? 'Configuring...' : 'Configure'}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Enter the URL where you want to receive webhook notifications
          </p>
        </div>

        <Separator />

        {/* Current Configuration */}
        <div className="space-y-2">
          <Label>Current Configuration</Label>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant={currentWebhookInfo.status === 'active' ? 'default' : 'secondary'}>
                {currentWebhookInfo.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm font-mono text-gray-600">
                {currentWebhookInfo.endpoint || 'No webhook configured'}
              </span>
            </div>
            {currentWebhookInfo.endpoint && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(currentWebhookInfo.endpoint)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Test Webhook */}
        <div className="space-y-2">
          <Label>Test Webhook</Label>
          <Button 
            onClick={testWebhook} 
            variant="outline" 
            className="w-full"
            disabled={isTesting || currentWebhookInfo.status !== 'active'}
          >
            {isTesting ? 'Sending Test...' : 'Send Test Event'}
          </Button>
          <p className="text-xs text-gray-500">
            Send a test event to verify your webhook endpoint is working
          </p>
        </div>

        <Separator />

        {/* Webhook Payload Example */}
        <div className="space-y-2">
          <Label>Webhook Payload Example</Label>
          <div className="bg-gray-50 p-3 rounded-lg">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
{`{
  "type": "message_received",
  "message": {
    "id": "message_id_123",
    "from": "+1234567890@c.us",
    "body": "Hello, this is a test message",
    "timestamp": 1234567890,
    "hasMedia": false,
    "mediaType": null,
    "mediaPath": null
  }
}`}
            </pre>
          </div>
        </div>

        {/* Configuration Instructions */}
        <div className="space-y-3">
          <Label>Setup Instructions</Label>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2 border border-blue-200">
            <p className="text-sm font-medium text-blue-900">How to set up your webhook:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Deploy your webhook endpoint that accepts POST requests</li>
              <li>Enter your webhook URL in the field above</li>
              <li>Click "Configure" to save the webhook</li>
              <li>Use "Send Test Event" to verify the connection</li>
              <li>Your endpoint will now receive real-time WhatsApp notifications</li>
            </ol>
          </div>
        </div>

        {/* Supported Events */}
        <div className="space-y-2">
          <Label>Supported Events</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">message_received</Badge>
            <Badge variant="outline">message_sent</Badge>
            <Badge variant="outline">media_received</Badge>
            <Badge variant="outline">webhook_test</Badge>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Security Note:</strong> Make sure your webhook endpoint validates incoming requests 
            and handles the payload securely. Consider implementing authentication headers or IP whitelisting.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
