import { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import type { UserProfile } from '../../backend';
import { Principal } from '@dfinity/principal';

interface CalleeLookupResult {
  profile: UserProfile | null;
  principal: Principal | null;
  isAvailable: boolean;
  error: string | null;
}

export function useCalleeLookup() {
  const { actor } = useActor();
  const [isLookingUp, setIsLookingUp] = useState(false);

  const lookupByPhoneNumber = async (phoneNumber: string): Promise<CalleeLookupResult> => {
    if (!actor) {
      return { profile: null, principal: null, isAvailable: false, error: 'Not connected' };
    }

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      return { profile: null, principal: null, isAvailable: false, error: 'Please enter a phone number' };
    }

    setIsLookingUp(true);
    try {
      // Step 1: Get the principal from phone number
      let principal: Principal;
      try {
        principal = await actor.getPrincipalFromPhoneNumber(trimmedPhone);
      } catch (error: any) {
        // If the backend traps with "not registered", return user not found
        if (error.message && error.message.includes('not registered')) {
          return { profile: null, principal: null, isAvailable: false, error: 'User not found' };
        }
        return { profile: null, principal: null, isAvailable: false, error: 'User not found' };
      }

      // Step 2: Check if the user is available
      const available = await actor.isAvailable(principal);
      if (!available) {
        return { profile: null, principal, isAvailable: false, error: 'User is not available' };
      }

      // Step 3: Get the profile for display purposes
      const profile = await actor.getUserByPhoneNumber(trimmedPhone);
      if (!profile) {
        return { profile: null, principal, isAvailable: false, error: 'User not found' };
      }

      return { profile, principal, isAvailable: true, error: null };
    } catch (error: any) {
      return { profile: null, principal: null, isAvailable: false, error: error.message || 'Failed to lookup user' };
    } finally {
      setIsLookingUp(false);
    }
  };

  return { lookupByPhoneNumber, isLookingUp };
}
