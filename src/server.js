import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import seoRoutes from './routes/seoRoutes.js';

const app = express();

// ─── Security & CORS ──────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // Allow localhost and specified frontend URLs
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow live frontend access
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);

// ─── Rate Limiting ─────────────────────────────────────
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { success: false, error: 'Too many requests. Please wait a moment.' },
});
app.use('/api/', limiter);

// ─── Body Parser ───────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Routes ────────────────────────────────────────────
app.use('/api/seo', seoRoutes);

// ─── Health Check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

// ─── Error Handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// ─── Export App for Vercel Serverless ──────────────────
export default app;

// ─── Start Server Locally Only ─────────────────────────
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`\n🚀 YouTube SEO Generator Backend`);
    console.log(`   Running on http://localhost:${config.port}`);
    console.log(`   Endpoints:`);
    console.log(`     POST /api/seo/youtube`);
    console.log(`     POST /api/seo/script`);
    console.log(`     GET  /api/health\n`);
  });
}
