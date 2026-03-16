import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001/api"
).replace("/api", "");

let _socket = null;

/**
 * Returns a singleton socket.io client.  Call connect(userId) to join the
 * user-specific room so the server can target notifications to this client.
 */
export function getSocket() {
  if (!_socket) {
    _socket = io(SOCKET_URL, { autoConnect: false, transports: ["websocket"] });
  }
  return _socket;
}

/**
 * Hook: connects the socket for the given userId and returns it.
 * Cleans up on unmount only if userId is falsy (logged out).
 */
export function useSocket(userId) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join", userId);

    return () => {
      // Do NOT disconnect on remount — keep the singleton alive.
    };
  }, [userId]);

  return socketRef.current ?? getSocket();
}

export default useSocket;
