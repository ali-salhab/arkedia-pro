import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SERVER_ORIGIN } from "../utils/apiBase";

let _socket = null;

/**
 * Returns a singleton socket.io client.  Call connect(userId) to join the
 * user-specific room so the server can target notifications to this client.
 */
export function getSocket() {
  if (!_socket) {
    _socket = io(SERVER_ORIGIN, {
      autoConnect: false,
      transports: ["websocket"],
    });
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
