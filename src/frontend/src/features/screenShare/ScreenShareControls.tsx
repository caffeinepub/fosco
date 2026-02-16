import { Button } from '@/components/ui/button';
import { MonitorUp, MonitorX } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScreenShareControlsProps {
  isSharing: boolean;
  onStart: () => void;
  onStop: () => void;
  error?: string | null;
  disabled?: boolean;
}

export default function ScreenShareControls({
  isSharing,
  onStart,
  onStop,
  error,
  disabled = false,
}: ScreenShareControlsProps) {
  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        onClick={isSharing ? onStop : onStart}
        disabled={disabled}
        variant={isSharing ? 'destructive' : 'default'}
        className="w-full gap-2"
      >
        {isSharing ? (
          <>
            <MonitorX className="h-4 w-4" />
            Stop Screen Share
          </>
        ) : (
          <>
            <MonitorUp className="h-4 w-4" />
            Start Screen Share
          </>
        )}
      </Button>
    </div>
  );
}
