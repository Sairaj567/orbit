import { Wifi, WifiOff } from 'lucide-react';
import { useRealtime } from '@/hooks/use-realtime';

export function ConnectionStatus() {
  const { isConnected } = useRealtime();

  if (isConnected) {
    return (
      <div className="flex items-center text-emerald-500/80" title="Connected to real-time updates">
        <Wifi className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex items-center text-muted-foreground/70" title="Disconnected from real-time updates">
      <WifiOff className="h-4 w-4" />
    </div>
  );
}
