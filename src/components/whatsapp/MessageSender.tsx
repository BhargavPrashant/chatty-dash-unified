
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface MessageSenderProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

export const MessageSender = ({ connectionStatus }: MessageSenderProps) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

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

    setIsSending(true);
    
    try {
      // Mock API call - replace with actual backend call
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast({
        title: "Message Sent",
        description: `Message sent successfully to ${phoneNumber}`,
      });
      
      // Clear form
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
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
