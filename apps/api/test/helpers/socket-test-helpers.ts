import type { Socket } from 'socket.io-client';

export function waitForEvent<T = unknown>(
  socket: Socket,
  event: string,
  timeoutMs = 3000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, listener);
      reject(new Error(`Timeout waiting for socket event "${event}" after ${timeoutMs}ms`));
    }, timeoutMs);

    const listener = (data: T) => {
      clearTimeout(timer);
      socket.off(event, listener);
      resolve(data);
    };

    socket.on(event, listener);
  });
}

export function ensureNoEvent(socket: Socket, event: string, waitMs = 500): Promise<void> {
  return new Promise((resolve, reject) => {
    const listener = (data: unknown) => {
      socket.off(event, listener);
      reject(new Error(`Unexpected socket event "${event}" received: ${JSON.stringify(data)}`));
    };

    socket.on(event, listener);

    setTimeout(() => {
      socket.off(event, listener);
      resolve();
    }, waitMs);
  });
}
