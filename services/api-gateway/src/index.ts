import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const PORT = process.env.PORT ?? 3000;

const AUTH_SERVICE_URL    = process.env.AUTH_SERVICE_URL    ?? 'http://localhost:3001';
const BARBER_SERVICE_URL  = process.env.BARBER_SERVICE_URL  ?? 'http://localhost:3002';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL ?? 'http://localhost:3003';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3004';
const REPORT_SERVICE_URL  = process.env.REPORT_SERVICE_URL  ?? 'http://localhost:3005';

const app = express();

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok' },
    message: 'api-gateway running',
  });
});

// ─── Proxy routes (http-proxy-middleware v2) ──────────────────────────────────

// /api/auth/* → auth-service:3001
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/auth' },
  })
);

// /api/admin/* → auth-service:3001
app.use(
  '/api/admin',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/admin': '/admin' },
  })
);

// /api/barbers/* → barber-service:3002
app.use(
  '/api/barbers',
  createProxyMiddleware({
    target: BARBER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/barbers': '/barbers' },
  })
);

// /api/bookings/* → booking-service:3003
app.use(
  '/api/bookings',
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/bookings': '/appointments' },
  })
);

// /api/catalog/* → catalog-service:3004
app.use(
  '/api/catalog',
  createProxyMiddleware({
    target: CATALOG_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/catalog': '/catalog' },
  })
);

// /api/reports/* → report-service:3005
app.use(
  '/api/reports',
  createProxyMiddleware({
    target: REPORT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/reports': '/reports' },
  })
);

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`[api-gateway] Running on port ${PORT}`);
  console.log(`  /api/auth     → ${AUTH_SERVICE_URL}`);
  console.log(`  /api/admin    → ${AUTH_SERVICE_URL}`);
  console.log(`  /api/barbers  → ${BARBER_SERVICE_URL}`);
  console.log(`  /api/bookings → ${BOOKING_SERVICE_URL}`);
  console.log(`  /api/catalog  → ${CATALOG_SERVICE_URL}`);
  console.log(`  /api/reports  → ${REPORT_SERVICE_URL}`);
});

export { app };
