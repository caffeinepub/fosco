import { useState } from 'react';
import { useCalleeLookup } from './useCalleeLookup';
import { useActor } from '../../hooks/useActor';
import { useInitiateCall } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { toast } from 'sonner';

interface OutgoingCallPanelProps {
  onCallInitiated: (calleePrincipal: string) => void;
}

export default function OutgoingCallPanel({ onCallInitiated }: OutgoingCallPanelProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { lookupByPhoneNumber, isLookingUp } = useCalleeLookup();
  const { mutate: initiateCall, isPending: isInitiating } = useInitiateCall();
  const { actor } = useActor();

  const handleCall = async () => {
    const { profile, error } = await lookupByPhoneNumber(phoneNumber);

    if (error) {
      toast.error(error);
      return;
    }

    if (!profile || !actor) {
      toast.error('User not available');
      return;
    }

    // Get the principal for this phone number
    try {
      const userProfile = await actor.getUserByPhoneNumber(phoneNumber.trim());
      if (!userProfile) {
        toast.error('User not available');
        return;
      }

      // For now, we need to find a way to get the principal
      // This is a limitation - we'll need to store principal in the profile or have a separate lookup
      toast.error('Unable to initiate call - principal lookup not available');
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate call');
    }
  };

  const isLoading = isLookingUp || isInitiating;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Call</CardTitle>
        <CardDescription>Enter a phone number to call another user</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            type="tel"
            placeholder="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCall();
              }
            }}
          />
          <Button onClick={handleCall} disabled={isLoading || !phoneNumber.trim()}>
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Phone className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
