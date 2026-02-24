"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface ISocketContext {
  socket: Socket | null;
  onlineUsers: string[];
}

interface ISocketProvider {
  children: React.ReactNode;
}

// Create context
const SocketContext = createContext<ISocketContext>({
  socket: null,
  onlineUsers: [],
});

// Create provider
export const SocketProvider: React.FC<ISocketProvider> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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
        // Sending query to server in `userId`
        query: {
          userId: user?._id,
        },
      });

      setSocket(newSocket);

      // LISTEN TO EMIT EVENTS FROM SERVER
      newSocket.on("getOnlineUser", (users: string[]) => {
        setOnlineUsers(users);
      });
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
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

// Create custom hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    return new Error(
      "useSocket hook must be used withing SocketContext Provider",
    );
  } else {
    return context;
  }
};
