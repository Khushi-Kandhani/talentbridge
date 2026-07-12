import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './store/authStore';

export function useSocket() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string }>>([]);

  const client = useMemo(() => {
    if (!accessToken) return null;
    return io('http://localhost:3000', {
      auth: { token: accessToken },
      transports: ['websocket'],
    });
  }, [accessToken]);

  useEffect(() => {
    if (!client) return;
    setSocket(client);

    const onEvent = (payload: any) => {
      const message = payload?.stage ? `Application moved to ${payload.stage}` : payload?.response ? `Offer ${payload.response}` : 'New update';
      setNotifications((prev) => [{ id: Date.now(), message }, ...prev].slice(0, 5));
    };

    client.on('application:stage-changed', onEvent);
    client.on('interview:confirmed', onEvent);
    client.on('offer:responded', onEvent);

    return () => {
      client.off('application:stage-changed', onEvent);
      client.off('interview:confirmed', onEvent);
      client.off('offer:responded', onEvent);
      client.disconnect();
      setSocket(null);
    };
  }, [client]);

  return { socket, notifications };
}
