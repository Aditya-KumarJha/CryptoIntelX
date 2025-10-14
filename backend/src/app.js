require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
const userRoutes = require('./routes/userRoutes');

const app = express();

const path = require('path');

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.VERCEL_CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS policy: This origin is not allowed'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());
require('./config/passport');

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
const networkRoutes = require('./routes/networkRoutes');
app.use('/api/network', networkRoutes);
const caseRoutes = require('./routes/caseRoutes');
app.use('/api/cases', caseRoutes);
const investigationRoutes = require('./routes/investigationRoutes');
app.use('/api/investigations', investigationRoutes);

// serve generated exports (PDFs)
app.use('/exports', express.static(path.resolve(__dirname, '..', 'exports')));

const workerRoutes = require('./routes/workerRoutes');
app.use('/workers', workerRoutes);

const schedulerRoutes = require('./routes/schedulerRoutes');
app.use('/api/scheduler', schedulerRoutes);

const threatRoutes = require('./routes/threatRoutes');
app.use('/api/threat', threatRoutes);

app.get('/', (req, res) => res.send('API is running'));

app.use((err, req, res, next) => {
  if (err.message.startsWith('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
