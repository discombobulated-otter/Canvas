// src/context/SocketContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Create the context
const SocketContext = createContext(null);

// Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"], // optional: ensures WebSocket transport
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected socket ID:", socketInstance.id);
      socketInstance.emit("custom-connection", { socketId: socketInstance.id });
    });

    return () => {
      socketInstance.disconnect();
      console.log("Socket disconnected");
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket
export const useSocket = () => {
  return useContext(SocketContext);
};
