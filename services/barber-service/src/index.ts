import express from 'express';
import { barberRouter } from './routes/barber-routes';
import { errorMiddleware } from './middlewares/error-middleware';

const PORT = process.env.PORT ?? 3002;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' }, message: 'barber-service running' });
});

app.use('/barbers', barberRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[barber-service] Running on port ${PORT}`);
});

export { app };
