import { useState, useCallback } from 'react';
import { useEnableScreenCast, useDisableScreenCast } from '../../hooks/useQueries';
import { toast } from 'sonner';

export function useScreenShare() {
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: enableScreenCast } = useEnableScreenCast();
  const { mutate: disableScreenCast } = useDisableScreenCast();

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      // Enable screen cast in backend
      enableScreenCast(undefined, {
        onSuccess: () => {
          setScreenStream(stream);
          setIsSharing(true);
          setError(null);

          // Handle when user stops sharing via browser UI
          stream.getVideoTracks()[0].onended = () => {
            stopScreenShare();
          };
        },
        onError: (err: any) => {
          stream.getTracks().forEach((track) => track.stop());
          const errorMsg = err.message.includes('already in progress')
            ? 'Only one person can screen-cast at a time. Please decide who will share and try again.'
            : 'Failed to start screen sharing';
          setError(errorMsg);
          toast.error(errorMsg);
        },
      });
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError'
        ? 'Screen sharing permission denied'
        : 'Failed to start screen sharing';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }, [enableScreenCast]);

  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setIsSharing(false);
    setError(null);
    disableScreenCast();
  }, [screenStream, disableScreenCast]);

  return {
    screenStream,
    isSharing,
    error,
    startScreenShare,
    stopScreenShare,
  };
}
