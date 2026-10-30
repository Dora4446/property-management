import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { sendSuccess, sendError } from './utils/apiResponse';

// Import route modules
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import propertyRoutes from './routes/propertyRoutes';
import tenantRoutes from './routes/tenantRoutes';
import agreementRoutes from './routes/agreementRoutes';
import paymentRoutes from './routes/paymentRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import expenseRoutes from './routes/expenseRoutes';
import notificationRoutes from './routes/notificationRoutes';
import visitRoutes from './routes/visitRoutes';
import reportRoutes from './routes/reportRoutes';

const app: Application = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const configuredOrigins = (ENV.CLIENT_URL || '')
        .split(',')
        .map((url) => url.trim().replace(/\/$/, ''))
        .filter(Boolean);
      const defaultOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
      ];
      const isAllowed =
        configuredOrigins.includes(origin) ||
        defaultOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.onrender.com');

      if (isAllowed || ENV.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive during hosting setup
    },
    credentials: true,
  })
);
app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

import mongoose from 'mongoose';

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  const isConnected = mongoose.connection.readyState === 1;
  const isMemory = mongoose.connection.host?.includes('127.0.0.1') || mongoose.connection.host?.includes('localhost');
  return sendSuccess(res, 'PropertyHub API is healthy and operational', {
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: ENV.NODE_ENV,
    region: 'India (IST)',
    currency: 'INR (₹)',
    database: {
      connected: isConnected,
      readyState: mongoose.connection.readyState,
      type: isConnected ? (isMemory ? 'Embedded In-Memory MongoDB (Fallback)' : 'MongoDB Atlas Cloud') : 'Disconnected',
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'none'
    }
  });
});

// Mount application API modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/reports', reportRoutes);

// 404 Handler for undefined routes
app.use((req: Request, res: Response) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, null, 404);
});

// Centralized error handler
app.use(errorHandler);

export default app;
