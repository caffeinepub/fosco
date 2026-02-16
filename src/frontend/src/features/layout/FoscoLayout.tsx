import { useState, useEffect } from 'react';
import { useAvailability } from '../../hooks/useAvailability';
import { useGetCallStatus } from '../../hooks/useQueries';
import { useScreenShare } from '../screenShare/useScreenShare';
import LoginButton from '../auth/LoginButton';
import ProfileDialog from '../profile/ProfileDialog';
import ShareButton from '../share/ShareButton';
import FoscoBranding from '../branding/FoscoBranding';
import MovieWindow from './MovieWindow';
import FacetimeOverlay from './FacetimeOverlay';
import CallSurface from '../call/CallSurface';
import ScreenShareControls from '../screenShare/ScreenShareControls';
import OutgoingCallPanel from '../call/OutgoingCallPanel';

export default function FoscoLayout() {
  useAvailability();
  const { data: callStatus } = useGetCallStatus();
  const { screenStream, isSharing, error: screenShareError, startScreenShare, stopScreenShare } = useScreenShare();
  const [isInCall, setIsInCall] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleCallStateChange = (inCall: boolean) => {
    setIsInCall(inCall);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <FoscoBranding size="small" />
          <div className="flex items-center gap-2">
            <ShareButton />
            <ProfileDialog />
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Movie/Screen-cast window */}
        <MovieWindow screenStream={screenStream} isInCall={isInCall} />

        {/* Facetime overlay */}
        <FacetimeOverlay isFullscreen={isFullscreen}>
          <CallSurface onCallStateChange={handleCallStateChange} />
        </FacetimeOverlay>

        {/* Controls sidebar (only when not in fullscreen) */}
        {!isFullscreen && (
          <div className="absolute top-4 right-4 w-80 space-y-4">
            {!isInCall && <OutgoingCallPanel onCallInitiated={() => {}} />}
            {isInCall && (
              <ScreenShareControls
                isSharing={isSharing}
                onStart={startScreenShare}
                onStop={stopScreenShare}
                error={screenShareError}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FOSCO. Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
