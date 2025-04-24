import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';
import canvasRoutes from './routes/canvas.routes.js';
import connectToDB from './connectDb/connectDb.js';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';


dotenv.config();
connectToDB();
const app = express();

const PORT = process.env.PORT || 5000;


// CORS configuration
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

app.use(cors({
  origin: process.env.FRONTEND_URL, // e.g. http://localhost:5173
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware())




// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running' });
});

app.use('/api/user', userRoutes);
app.use('/api/canvas', canvasRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
