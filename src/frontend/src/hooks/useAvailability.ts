import { useEffect } from 'react';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useAvailability() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  useEffect(() => {
    if (!actor || !identity) return;

    // Mark as available when component mounts
    actor.setAvailable(null).catch(console.error);

    // Mark as unavailable on unmount or visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        actor.setUnavailable(null).catch(console.error);
      } else {
        actor.setAvailable(null).catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      actor.setUnavailable(null).catch(console.error);
    };
  }, [actor, identity]);
}
