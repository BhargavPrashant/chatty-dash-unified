
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface MediaUploaderProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

export const MediaUploader = ({ connectionStatus }: MediaUploaderProps) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSendMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !selectedFile) {
      toast({
        title: "Validation Error",
        description: "Please provide phone number and select a file",
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

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('phoneNumber', phoneNumber);
      formData.append('media', selectedFile);
      if (caption) {
        formData.append('caption', caption);
      }

      // Mock API call - replace with actual backend call
      const response = await fetch('/api/send-media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send media');
      }

      toast({
        title: "Media Sent",
        description: `${selectedFile.name} sent successfully to ${phoneNumber}`,
      });
      
      // Clear form
      setCaption('');
      setSelectedFile(null);
      const fileInput = document.getElementById('mediaFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error sending media:', error);
      toast({
        title: "Send Failed",
        description: "Unable to send media. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <form onSubmit={handleSendMedia} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+1234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={isUploading}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="mediaFile">Select Media File</Label>
        <Input
          id="mediaFile"
          type="file"
          onChange={handleFileSelect}
          disabled={isUploading}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
        <p className="text-xs text-gray-500">
          Supported: Images, Videos, Audio, PDF, Documents (Max: 10MB)
        </p>
      </div>

      {selectedFile && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  const fileInput = document.getElementById('mediaFile') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
              >
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="caption">Caption (Optional)</Label>
        <Textarea
          id="caption"
          placeholder="Add a caption to your media..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={isUploading}
          rows={3}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isUploading || connectionStatus !== 'connected' || !selectedFile}
        className="w-full"
      >
        {isUploading ? 'Sending...' : 'Send Media'}
      </Button>

      {connectionStatus !== 'connected' && (
        <p className="text-sm text-amber-600 text-center">
          ⚠️ Please connect to WhatsApp Web to send media
        </p>
      )}
    </form>
  );
};
