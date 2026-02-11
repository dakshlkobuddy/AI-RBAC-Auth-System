const express = require('express');
const cors = require('cors');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const supportTicketRoutes = require('./routes/supportTicketRoutes');
const emailRoutes = require('./routes/emailRoutes');
const contactRoutes = require('./routes/contactRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const { startImapPolling } = require('./services/imapService');

const app = express();

// Middleware
app.use(express.json());
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const isDev = (process.env.NODE_ENV || 'development') !== 'production';
const defaultDevOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

const corsOrigin = (origin, callback) => {
  // Allow server-to-server / curl / Postman requests with no Origin header
  if (!origin) return callback(null, true);

  const whitelist = isDev
    ? [...new Set([...allowedOrigins, ...defaultDevOrigins])]
    : allowedOrigins;

  if (whitelist.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error('CORS blocked for this origin'));
};

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/support/tickets', supportTicketRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/marketing', marketingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║     Email-Based CRM System with RBAC                   ║
║     Server running on http://localhost:${PORT}              ║
╚════════════════════════════════════════════════════════╝
  `);
  startImapPolling();
});
