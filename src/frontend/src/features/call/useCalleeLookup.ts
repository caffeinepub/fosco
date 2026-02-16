import { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import type { UserProfile } from '../../backend';

export function useCalleeLookup() {
  const { actor } = useActor();
  const [isLookingUp, setIsLookingUp] = useState(false);

  const lookupByPhoneNumber = async (phoneNumber: string): Promise<{ profile: UserProfile | null; error: string | null }> => {
    if (!actor) {
      return { profile: null, error: 'Not connected' };
    }

    if (!phoneNumber.trim()) {
      return { profile: null, error: 'Please enter a phone number' };
    }

    setIsLookingUp(true);
    try {
      const profile = await actor.getUserByPhoneNumber(phoneNumber.trim());
      
      if (!profile) {
        return { profile: null, error: 'User not found' };
      }

      // Check if user is available
      const principal = await actor.getUserByPhoneNumber(phoneNumber.trim());
      if (!principal) {
        return { profile: null, error: 'User not available' };
      }

      return { profile, error: null };
    } catch (error: any) {
      return { profile: null, error: error.message || 'Failed to lookup user' };
    } finally {
      setIsLookingUp(false);
    }
  };

  return { lookupByPhoneNumber, isLookingUp };
}
