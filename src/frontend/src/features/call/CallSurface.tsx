import { useEffect, useRef } from 'react';
import { useWebRTCCall } from './useWebRTCCall';
import { useGetCallStatus, useAnswerCall, useEndCall } from '../../hooks/useQueries';
import IncomingCallPrompt from './IncomingCallPrompt';
import InCallControls from './InCallControls';

interface CallSurfaceProps {
  onCallStateChange?: (isInCall: boolean) => void;
}

export default function CallSurface({ onCallStateChange }: CallSurfaceProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { data: callStatus } = useGetCallStatus();
  const { mutate: answerCall, isPending: isAnswering } = useAnswerCall();
  const { mutate: endCall, isPending: isDeclining } = useEndCall();

  const {
    localStream,
    remoteStream,
    isConnected,
    error,
    isMuted,
    isCameraOff,
    answerCall: webrtcAnswerCall,
    endCall: webrtcEndCall,
    toggleMute,
    toggleCamera,
  } = useWebRTCCall();

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Notify parent of call state changes
  useEffect(() => {
    const isInCall = callStatus?.__kind__ === 'inCall';
    onCallStateChange?.(isInCall);
  }, [callStatus, onCallStateChange]);

  const handleAnswer = () => {
    if (callStatus?.__kind__ === 'incoming') {
      const callerPrincipal = callStatus.incoming.caller;
      answerCall();
      webrtcAnswerCall(callerPrincipal);
    }
  };

  const handleDecline = () => {
    endCall();
  };

  const handleEndCall = () => {
    webrtcEndCall();
    endCall();
  };

  // Incoming call state
  if (callStatus?.__kind__ === 'incoming') {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <IncomingCallPrompt
          callerName="User"
          onAnswer={handleAnswer}
          onDecline={handleDecline}
          disabled={isAnswering || isDeclining}
        />
      </div>
    );
  }

  // In call state
  if (callStatus?.__kind__ === 'inCall') {
    return (
      <div className="relative h-full w-full">
        {/* Remote video (larger) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
        
        {/* Local video (smaller, overlay) */}
        <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <InCallControls
            onEndCall={handleEndCall}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
          />
        </div>

        {/* Error display */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Idle state
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-muted-foreground">No active call</p>
    </div>
  );
}
