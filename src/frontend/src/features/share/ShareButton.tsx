import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButton() {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);

    try {
      const shareUrl = window.location.origin;
      const shareData = {
        title: 'FOSCO',
        text: 'Check out FOSCO - a video calling app',
        url: shareUrl,
      };

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        // No toast needed for native share - the OS handles feedback
      } else {
        // Fallback to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            toast.success('Link copied to clipboard!');
          } catch (err) {
            toast.error('Failed to copy link');
          }
          document.body.removeChild(textArea);
        }
      }
    } catch (error: any) {
      // User cancelled the share or an error occurred
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        toast.error('Failed to share link');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing}
      variant="ghost"
      size="icon"
      aria-label="Share FOSCO"
    >
      <Share2 className="h-5 w-5" />
    </Button>
  );
}
