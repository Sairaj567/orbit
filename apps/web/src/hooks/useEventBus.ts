import { useEffect } from 'react';

interface EventMap {
  [key: string]: unknown;
}

type EventHandler<T> = (data: T) => void;

interface EventBusLike {
  on: <T extends keyof EventMap>(event: T, handler: EventHandler<EventMap[T]>) => () => void;
}

export function useEventBus<T extends keyof EventMap>(event: T, handler: EventHandler<EventMap[T]>, bus?: EventBusLike): void {
  useEffect(() => {
    if (!bus) return undefined;
    return bus.on(event, handler);
  }, [bus, event, handler]);
}