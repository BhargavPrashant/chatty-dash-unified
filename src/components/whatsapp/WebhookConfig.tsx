
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const WebhookConfig = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  
  // This would be your actual webhook URL endpoint
  const currentWebhookUrl = `${window.location.origin}/api/webhook/whatsapp`;
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Webhook URL copied to clipboard",
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

  const testWebhook = async () => {
    try {
      const response = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Webhook Test Successful",
          description: "Test webhook event sent successfully",
        });
      } else {
        throw new Error('Webhook test failed');
      }
    } catch (error) {
      toast({
        title: "Webhook Test Failed",
        description: "Unable to send test webhook event",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Configuration</CardTitle>
        <CardDescription>
          Configure WhatsApp webhook to receive incoming messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Webhook URL */}
        <div className="space-y-2">
          <Label>Your Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              value={currentWebhookUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(currentWebhookUrl)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Use this URL in your WhatsApp Business API webhook configuration
          </p>
        </div>

        <Separator />

        {/* Webhook Status */}
        <div className="space-y-2">
          <Label>Webhook Status</Label>
          <div className="flex items-center gap-2">
            <Badge variant="default">Active</Badge>
            <span className="text-sm text-gray-600">Ready to receive events</span>
          </div>
        </div>

        <Separator />

        {/* Test Webhook */}
        <div className="space-y-2">
          <Label>Test Webhook</Label>
          <Button onClick={testWebhook} variant="outline" className="w-full">
            Send Test Event
          </Button>
          <p className="text-xs text-gray-500">
            Send a test event to verify webhook is working
          </p>
        </div>

        <Separator />

        {/* Configuration Instructions */}
        <div className="space-y-3">
          <Label>Setup Instructions</Label>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">To configure WhatsApp webhook:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Go to your WhatsApp Business API provider</li>
              <li>Navigate to webhook configuration</li>
              <li>Enter the webhook URL above</li>
              <li>Select events: messages, message_status</li>
              <li>Save and verify the webhook</li>
            </ol>
          </div>
        </div>

        {/* Supported Events */}
        <div className="space-y-2">
          <Label>Supported Events</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">messages</Badge>
            <Badge variant="outline">message_status</Badge>
            <Badge variant="outline">message_deliveries</Badge>
            <Badge variant="outline">message_reads</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
