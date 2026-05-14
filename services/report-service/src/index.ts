import express from 'express';
import { reportRouter } from './routes/report-routes';
import { errorMiddleware } from './middlewares/error-middleware';
import { BARBER_EARNINGS_PERCENTAGE } from './services/report-service';

const PORT = process.env.PORT ?? 3005;

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      barberEarningsPercentage: BARBER_EARNINGS_PERCENTAGE,
    },
    message: 'report-service running',
  });
});

// Routes
app.use('/reports', reportRouter);

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
});

// Global error handler — must be last
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[report-service] Running on port ${PORT}`);
  console.log(`[report-service] Barber earnings percentage: ${BARBER_EARNINGS_PERCENTAGE}%`);
});

export { app };
