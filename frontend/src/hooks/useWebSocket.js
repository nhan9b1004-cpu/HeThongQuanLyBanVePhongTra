import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useWebSocket(showId) {
  const socketRef = useRef(null);
  const [lastSeatUpdate, setLastSeatUpdate] = useState(null);

  useEffect(() => {
    if (!showId) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('joinShow', showId);

    socket.on('seat:updated', (payload) => {
      setLastSeatUpdate(payload);
    });

    return () => {
      socket.emit('leaveShow', showId);
      socket.disconnect();
    };
  }, [showId]);

  return { lastSeatUpdate };
}