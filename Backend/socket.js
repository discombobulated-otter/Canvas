// socket.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config(); // make sure environment variables are loaded

const app = express();
const server = createServer(app);

// Set up Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Example custom event
  socket.on('custom-connection', (data) => {
    console.log('Received data from client:', data);
  });
   socket.on("canvas-edit", ({ projectId, canvasData }) => {
    // Broadcast to all clients in the same room *except* the sender
    console.log("edit")
    socket.to(projectId).emit("receive-canvas-update", JSON.stringify(canvasData));
  });
  socket.on("joinRoom",(id)=>{
    socket.join(id);
  })


  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

export { app, server };
