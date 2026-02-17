import { useRef, useState, useCallback, useEffect } from 'react';
import { useSendSignal, useFetchSignals, useClearSignals } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import type { SignalMessage } from '../../backend';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTCCall() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remotePrincipalRef = useRef<Principal | null>(null);
  const pendingSignalsRef = useRef<SignalMessage[]>([]);

  const { mutate: sendSignal } = useSendSignal();
  const { data: signals = [] } = useFetchSignals();
  const { mutate: clearSignals } = useClearSignals();

  // Initialize local media
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setError(null);
      return stream;
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera and microphone access denied. Please allow access to continue.'
        : 'Failed to access camera and microphone';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Process a single signal
  const processSignal = useCallback(async (signal: SignalMessage, pc: RTCPeerConnection) => {
    try {
      if (signal.__kind__ === 'offer') {
        const offer = JSON.parse(signal.offer);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        if (remotePrincipalRef.current) {
          sendSignal({
            target: remotePrincipalRef.current,
            message: {
              __kind__: 'answer',
              answer: JSON.stringify(answer),
            },
          });
        }
      } else if (signal.__kind__ === 'answer') {
        const answer = JSON.parse(signal.answer);
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } else if (signal.__kind__ === 'iceCandidate') {
        const candidate = JSON.parse(signal.iceCandidate);
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error('Error processing signal:', err);
    }
  }, [sendSignal]);

  // Create peer connection
  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add local tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && remotePrincipalRef.current) {
        sendSignal({
          target: remotePrincipalRef.current,
          message: {
            __kind__: 'iceCandidate',
            iceCandidate: JSON.stringify(event.candidate),
          },
        });
      }
    };

    // Handle connection state
    pc.onconnectionstatechange = () => {
      setIsConnected(pc.connectionState === 'connected');
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setError('Connection lost');
      }
    };

    peerConnectionRef.current = pc;

    // Process any pending signals immediately after creating the peer connection
    if (pendingSignalsRef.current.length > 0) {
      const signalsToProcess = [...pendingSignalsRef.current];
      pendingSignalsRef.current = [];
      
      (async () => {
        for (const signal of signalsToProcess) {
          await processSignal(signal, pc);
        }
      })();
    }

    return pc;
  }, [sendSignal, processSignal]);

  // Start call as caller
  const startCall = useCallback(async (calleePrincipal: Principal) => {
    try {
      remotePrincipalRef.current = calleePrincipal;
      const stream = await initializeMedia();
      const pc = createPeerConnection(stream);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendSignal({
        target: calleePrincipal,
        message: {
          __kind__: 'offer',
          offer: JSON.stringify(offer),
        },
      });
    } catch (err: any) {
      setError(err.message);
    }
  }, [initializeMedia, createPeerConnection, sendSignal]);

  // Answer call as callee
  const answerCall = useCallback(async (callerPrincipal: Principal) => {
    try {
      remotePrincipalRef.current = callerPrincipal;
      const stream = await initializeMedia();
      createPeerConnection(stream);
    } catch (err: any) {
      setError(err.message);
    }
  }, [initializeMedia, createPeerConnection]);

  // End call
  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setIsConnected(false);
    setError(null);
    remotePrincipalRef.current = null;
    pendingSignalsRef.current = [];
    clearSignals();
  }, [localStream, screenStream, clearSignals]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [localStream, isMuted]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  }, [localStream, isCameraOff]);

  // Process incoming signals
  useEffect(() => {
    if (signals.length === 0) return;

    const processSignals = async () => {
      // If peer connection exists, process signals immediately
      if (peerConnectionRef.current) {
        for (const signal of signals) {
          await processSignal(signal, peerConnectionRef.current);
        }
        clearSignals();
      } else {
        // If no peer connection yet, buffer the signals for later processing
        pendingSignalsRef.current = [...pendingSignalsRef.current, ...signals];
        clearSignals();
      }
    };

    processSignals();
  }, [signals, processSignal, clearSignals]);

  return {
    localStream,
    remoteStream,
    screenStream,
    isConnected,
    error,
    isMuted,
    isCameraOff,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleCamera,
    setScreenStream,
  };
}
