import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useApiCall } from "@/hooks/useApi";
import { messageApi } from "@/services/api";

interface MessageSenderProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

export const MessageSender = ({ connectionStatus }: MessageSenderProps) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const { loading: isSending, execute: executeSend } = useApiCall();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !message) {
      toast({
        title: "Validation Error",
        description: "Please fill in both phone number and message",
        variant: "destructive",
      });
      return;
    }

    if (connectionStatus !== 'connected') {
      toast({
        title: "Connection Required",
        description: "Please connect to WhatsApp Web first",
        variant: "destructive",
      });
      return;
    }

    await executeSend(async () => {
      const response = await messageApi.sendMessage(phoneNumber, message);
      
      if (response.success) {
        toast({
          title: "Message Sent",
          description: `Message sent successfully to ${phoneNumber}`,
        });
        // Clear form
        setMessage('');
      } else {
        toast({
          title: "Send Failed",
          description: response.error || "Unable to send message. Please try again.",
          variant: "destructive",
        });
      }
      
      return response;
    });
  };

  return (
    <form onSubmit={handleSendMessage} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+1234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={isSending}
        />
        <p className="text-xs text-gray-500">
          Include country code (e.g., +1 for US, +44 for UK)
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSending}
          rows={4}
        />
        <p className="text-xs text-gray-500">
          {message.length}/1000 characters
        </p>
      </div>

      <Button 
        type="submit" 
        disabled={isSending || connectionStatus !== 'connected'}
        className="w-full"
      >
        {isSending ? 'Sending...' : 'Send Message'}
      </Button>

      {connectionStatus !== 'connected' && (
        <p className="text-sm text-amber-600 text-center">
          ⚠️ Please connect to WhatsApp Web to send messages
        </p>
      )}
    </form>
  );
};
