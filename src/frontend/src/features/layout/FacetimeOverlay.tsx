import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FacetimeOverlayProps {
  children: ReactNode;
  isFullscreen: boolean;
}

export default function FacetimeOverlay({ children, isFullscreen }: FacetimeOverlayProps) {
  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-50 rounded-lg overflow-hidden border-2 border-primary shadow-2xl bg-card',
        isFullscreen ? 'w-64 h-48' : 'w-80 h-60'
      )}
    >
      {children}
    </div>
  );
}
