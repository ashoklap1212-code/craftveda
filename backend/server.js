import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';

// Fix for Windows DNS resolution for MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  // Ignored if custom DNS setting is restricted
}

import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

// Ensure uploads directory exists and serve statically
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Import Route Handlers
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

// 1. Standard CORS Configuration for React Frontend (Port 5173, 5174, etc.)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
};

// Enable standard cors middleware for all routes (automatically handles preflight OPTIONS)
app.use(cors(corsOptions));

// 2. Request Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// 3. Health Check & Root Welcome Endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'CraftVeda E-Commerce Express Server Running 🏺',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/products',
      '/api/auth',
      '/api/orders',
      '/api/wishlist',
    ],
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    databaseState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// 4. API Routes Mounting
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

// 5. 404 Route Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({ message: `API Endpoint Not Found: ${req.originalUrl}` });
});

// 6. Centralized Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Global Server Error:', err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// 7. Database Connection & Server Initialization Function
const connectDatabaseAndStartServer = async () => {
  try {
    if (!MONGO_URI) {
      console.warn('⚠️ MONGO_URI is missing in .env file. Please configure your MongoDB Atlas URI.');
    } else {
      console.log('⏳ Connecting to MongoDB Atlas...');
      await mongoose.connect(MONGO_URI);
      console.log('✅ Connected to MongoDB Atlas Database successfully!');
    }
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 CraftVeda Backend Server listening on http://localhost:${PORT}`);
    console.log(`📡 Base API Endpoint: http://localhost:${PORT}/api`);
  });
};

connectDatabaseAndStartServer();
