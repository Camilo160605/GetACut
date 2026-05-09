import express from 'express';
import { authRouter } from './routes/auth-routes';
import { adminRouter } from './routes/admin-routes';
import { errorMiddleware } from './middlewares/error-middleware';

const PORT = process.env.PORT ?? 3001;

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' }, message: 'auth-service running' });
});

// Routes
app.use('/auth', authRouter);
app.use('/admin', adminRouter);

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
});

// Global error handler — must be last
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[auth-service] Running on port ${PORT}`);
});

export { app };
