/* ============================================
   FINLY — server.js
   DecodeLabs Project 2 | Backend API
   Entry point: Express server setup,
   middleware, route mounting, error handling
   ============================================ */

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// ── Route imports ──
const budgetRoutes      = require('./routes/budgets');
const transactionRoutes = require('./routes/transactions');
const contactRoutes     = require('./routes/contact');

// ── App init ──
const app  = express();
const PORT = process.env.PORT || 3000;

/* ─────────────────────────────────────────
   MIDDLEWARE
───────────────────────────────────────── */

// Parse incoming JSON bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// CORS — allow frontend on same origin or localhost dev
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname)));

// ── Request logger (dev utility) ──
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

/* ─────────────────────────────────────────
   HEALTH CHECK ENDPOINT
   GET /api/health
   Returns: server status + timestamp
───────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status:  'ok',
    message: 'Finly API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/* ─────────────────────────────────────────
   ROUTE MOUNTING
───────────────────────────────────────── */
app.use('/api/budgets',      budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/contact',      contactRoutes);

/* ─────────────────────────────────────────
   ROOT — serve index.html
───────────────────────────────────────── */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ─────────────────────────────────────────
   404 HANDLER
   Catches any route that doesn't exist
───────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({
    status:  'error',
    code:    404,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

/* ─────────────────────────────────────────
   GLOBAL ERROR HANDLER
   Catches any server-side errors passed
   via next(err)
───────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    status:  'error',
    code:    err.status || 500,
    message: err.message || 'Internal Server Error',
  });
});

/* ─────────────────────────────────────────
   START SERVER
───────────────────────────────────────── */
app.listen(PORT, () => {
  console.log('');
  console.log('  ◎  FINLY API SERVER');
  console.log('  ─────────────────────────────');
  console.log(`  Running  → http://localhost:${PORT}`);
  console.log(`  Health   → http://localhost:${PORT}/api/health`);
  console.log(`  Budgets  → http://localhost:${PORT}/api/budgets`);
  console.log(`  Transactions → http://localhost:${PORT}/api/transactions`);
  console.log(`  Contact  → http://localhost:${PORT}/api/contact`);
  console.log('  ─────────────────────────────');
  console.log('');
});




