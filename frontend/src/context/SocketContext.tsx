"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface ISocketContext {
  socket: Socket | null;
}

interface ISocketProvider {
  children: React.ReactNode;
}

// Create context
const SocketContext = createContext<ISocketContext>({
  socket: null,
});

// Create provider
export const SocketProvider: React.FC<ISocketProvider> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    // Only making connection if user is logged in
    if (!user?._id) return;
    let newSocket: Socket | null;
    // fetching socket
    function fetchSocket() {
      newSocket = io(`${process.env.NEXT_PUBLIC_CHAT_SERVICE}`, {
        autoConnect: true,
        // Reconnection control
        reconnection: true,
        reconnectionAttempts: 5, // limit retries
        reconnectionDelay: 1000, // start delay
        reconnectionDelayMax: 5000, // max backoff
        timeout: 20000, // connection timeout
      });
      setSocket(newSocket);
    }
    fetchSocket();
    // cleanup
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Create custom hook
export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    return new Error(
      "useSocketContext hook must be used withing SocketContext Provider",
    );
  } else {
    return context;
  }
};
