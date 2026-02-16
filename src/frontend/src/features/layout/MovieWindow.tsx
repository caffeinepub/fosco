import { useRef, useEffect } from 'react';
import { useFullscreen } from './useFullscreen';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize } from 'lucide-react';

interface MovieWindowProps {
  screenStream: MediaStream | null;
  isInCall: boolean;
}

export default function MovieWindow({ screenStream, isInCall }: MovieWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-black flex items-center justify-center"
    >
      {screenStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="text-center space-y-4">
          <div className="text-6xl">🎬</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Movie Window</h2>
            <p className="text-gray-400">
              {isInCall
                ? 'Start screen sharing to watch together'
                : 'Start a call to begin watching together'}
            </p>
          </div>
        </div>
      )}

      {/* Fullscreen toggle */}
      {isInCall && (
        <Button
          onClick={toggleFullscreen}
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
