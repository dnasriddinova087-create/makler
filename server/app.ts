import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticate } from './middleware/auth';
import authRoutes from './routes/auth';
import regionsRoutes from './routes/regions';
import propertiesRoutes from './routes/properties';
import brokersRoutes from './routes/brokers';
import favoritesRoutes from './routes/favorites';
import viewingsRoutes from './routes/viewings';
import contractsRoutes from './routes/contracts';
import chatRoutes from './routes/chat';
import notificationsRoutes from './routes/notifications';
import reviewsRoutes from './routes/reviews';
import reportsRoutes from './routes/reports';
import adminRoutes from './routes/admin';

dotenv.config();

export const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global auth extractor
app.use(authenticate);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'IJARA.UZ',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/regions', regionsRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/brokers', brokersRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/viewings', viewingsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);

// Centralized error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Ichki server xatoligi yuz berdi'
  });
});
