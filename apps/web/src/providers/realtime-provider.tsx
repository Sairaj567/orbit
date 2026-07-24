import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';
import { useWorkspaceStore } from '../stores/workspace.store';
import { useProjectStore } from '../stores/project.store';
import type { RealtimeEvent, RealtimePayload } from '@orbit/shared';

interface RealtimeContextValue {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: <T extends RealtimeEvent>(event: T, callback: (payload: RealtimePayload<T>) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  socket: null,
  isConnected: false,
  subscribe: () => () => {},
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentWorkspaceId } = useWorkspaceStore();
  const { currentProjectId } = useProjectStore();

  useEffect(() => {
    if (!isSignedIn) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    let currentSocket: Socket | null = null;
    let isActive = true;

    const initSocket = async () => {
      try {
        const token = await getToken();
        if (!token || !isActive) return;

        const wsUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        const newSocket = io(wsUrl, {
          auth: { token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        newSocket.on('connect', () => {
          if (isActive) setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          if (isActive) setIsConnected(false);
        });

        if (isActive) {
          setSocket(newSocket);
          currentSocket = newSocket;
        } else {
          newSocket.disconnect();
        }
      } catch (err) {
        console.error('Failed to initialize socket', err);
      }
    };

    initSocket();

    return () => {
      isActive = false;
      if (currentSocket) {
        currentSocket.disconnect();
      }
    };
  }, [isSignedIn, getToken, socket]);

  // Join rooms based on current workspace/project
  useEffect(() => {
    if (!socket || !isConnected) return;

    if (currentWorkspaceId) {
      socket.emit('join_workspace', { workspaceId: currentWorkspaceId });
    }

    if (currentProjectId) {
      socket.emit('join_project', { projectId: currentProjectId });
    }

    return () => {
      if (currentWorkspaceId) {
        socket.emit('leave_workspace', { workspaceId: currentWorkspaceId });
      }
      if (currentProjectId) {
        socket.emit('leave_project', { projectId: currentProjectId });
      }
    };
  }, [socket, isConnected, currentWorkspaceId, currentProjectId]);

  const subscribe = useCallback(<T extends RealtimeEvent>(
    event: T,
    callback: (payload: RealtimePayload<T>) => void
  ) => {
    if (!socket) return () => {};

    socket.on(event as string, callback as (...args: unknown[]) => void);

    return () => {
      socket.off(event as string, callback as (...args: unknown[]) => void);
    };
  }, [socket]);

  return (
    <RealtimeContext.Provider value={{ socket, isConnected, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRealtime = () => useContext(RealtimeContext);
