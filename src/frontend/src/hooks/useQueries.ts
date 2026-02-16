import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CallStatus, SignalMessage } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<CallStatus>({
    queryKey: ['callStatus'],
    queryFn: async () => {
      if (!actor) return { __kind__: 'none', none: null };
      return actor.getCallStatus(null);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 1000, // Poll every second
  });
}

export function useInitiateCall() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (calleePrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.initiateCall(calleePrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callStatus'] });
    },
  });
}

export function useAnswerCall() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callerPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.answerCall(callerPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callStatus'] });
    },
  });
}

export function useEndCall() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.endCall(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callStatus'] });
    },
  });
}

export function useSendSignal() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ target, message }: { target: Principal; message: SignalMessage }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendSignal(target, message);
    },
  });
}

export function useFetchSignals() {
  const { actor, isFetching } = useActor();

  return useQuery<SignalMessage[]>({
    queryKey: ['signals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.fetchSignals(null);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 500, // Poll every 500ms for signals
  });
}

export function useClearSignals() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.clearSignals(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
    },
  });
}

export function useEnableScreenCast() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.enableScreenCast(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callStatus'] });
    },
  });
}

export function useDisableScreenCast() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.disableScreenCast(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callStatus'] });
    },
  });
}
