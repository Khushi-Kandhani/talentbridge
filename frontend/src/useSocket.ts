import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './store/authStore';

export function useSocket() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string }>>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setSocket(null);
      return;
    }

    const client = io('http://localhost:3000', {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    setSocket(client);
    setConnectionError(null);

    const onEvent = (payload: any) => {
      const message = payload?.stage ? `Application moved to ${payload.stage}` : payload?.response ? `Offer ${payload.response}` : 'New update';
      setNotifications((prev) => [{ id: Date.now() + Math.random(), message }, ...prev].slice(0, 5));
    };

    const onConnectError = (err: Error) => {
      setConnectionError(err.message || 'Could not connect to live updates.');
    };

    const onDisconnect = (reason: string) => {
      if (reason === 'io server disconnect' || reason === 'io client disconnect') return;
      setConnectionError('Live updates disconnected. Trying to reconnect…');
    };

    client.on('application:stage-changed', onEvent);
    client.on('interview:confirmed', onEvent);
    client.on('offer:responded', onEvent);
    client.on('connect_error', onConnectError);
    client.on('disconnect', onDisconnect);
    client.on('connect', () => setConnectionError(null));

    return () => {
      client.off('application:stage-changed', onEvent);
      client.off('interview:confirmed', onEvent);
      client.off('offer:responded', onEvent);
      client.off('connect_error', onConnectError);
      client.off('disconnect', onDisconnect);
      client.disconnect();
      setSocket(null);
    };
  }, [accessToken]);

  return { socket, notifications, connectionError };
}
