import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'node:url';

import { chatController } from './CONTROLLER/chat.js';
import { showcontroller } from './CONTROLLER/Show.js';
import { handleUpload } from './CONTROLLER/uploadcontroller.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.join(__dirname, 'Frontend');
const uploadDir = path.join(__dirname, 'data');

// Create upload directory if it does not exist
fs.mkdirSync(uploadDir, { recursive: true });

// Security
app.disable('x-powered-by');
app.use(helmet());

// CORS
const allowedOrigins = [
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:5000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://127.0.0.1:8000'
  ],
  allowedHeaders: ['Content-Type', 'x-gemini-api-key'],
  methods: ['GET', 'POST', 'OPTIONS']
}));

// Body parsing
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({
  extended: false,
  limit: '200kb'
}));

// Static frontend files
app.use(express.static(frontendDir));

// API key from request headers
app.use((req, res, next) => {
  req.geminiApiKey = req.get('x-gemini-api-key') || null;
  next();
});

// Multer storage
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadDir);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname);
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1
  }
});

// Rate limiters
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});

// Routes
app.get('/', showcontroller);

// Change 'file' to match the field name sent by your frontend.
app.post(
  '/upload-chat',
  uploadLimiter,
  upload.single('chatFile'),
  handleUpload
);

app.post('/chat', chatLimiter, chatController);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected'
  });
});

// Error handling
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: err.message
    });
  }

  if (err.message === 'Origin not allowed') {
    return res.status(403).json({
      error: 'Origin not allowed'
    });
  }

  console.error(err);

  res.status(500).json({
    error: 'Internal server error'
  });
});

mongoose.connect(
  process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/heartsync'
)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection failed:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});