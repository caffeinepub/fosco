import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, PhoneOff } from 'lucide-react';

interface IncomingCallPromptProps {
  callerName?: string;
  onAnswer: () => void;
  onDecline: () => void;
  disabled?: boolean;
}

export default function IncomingCallPrompt({
  callerName = 'Unknown',
  onAnswer,
  onDecline,
  disabled = false,
}: IncomingCallPromptProps) {
  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>Incoming Call</CardTitle>
        <CardDescription>{callerName} is calling you</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            onClick={onAnswer}
            disabled={disabled}
            className="flex-1 gap-2"
          >
            <Phone className="h-4 w-4" />
            Answer
          </Button>
          <Button
            onClick={onDecline}
            disabled={disabled}
            variant="destructive"
            className="flex-1 gap-2"
          >
            <PhoneOff className="h-4 w-4" />
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
