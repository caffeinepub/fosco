import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface InCallControlsProps {
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  isMuted: boolean;
  isCameraOff: boolean;
  disabled?: boolean;
}

export default function InCallControls({
  onEndCall,
  onToggleMute,
  onToggleCamera,
  isMuted,
  isCameraOff,
  disabled = false,
}: InCallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleMute}
        disabled={disabled}
        className="rounded-full"
      >
        {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleCamera}
        disabled={disabled}
        className="rounded-full"
      >
        {isCameraOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={onEndCall}
        disabled={disabled}
        className="rounded-full"
      >
        <PhoneOff className="h-4 w-4" />
      </Button>
    </div>
  );
}
