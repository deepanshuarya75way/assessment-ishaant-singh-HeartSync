// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
// import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import helmet from "helmet";
import rateLimit from  "express-rate-limit";
import bodyParser from "body-parser";
import { chatController } from './CONTROLLER/chat.js';
import { showcontroller } from './CONTROLLER/Show.js';
import { handleUpload } from './CONTROLLER/uploadcontroller.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");
app.use(helmet());


const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const projectRoot=path.dirname(__dirname);

const fortendDir=path.join(project,'Frontend');
const uploadDir=path.join(__dirname,'data');

fs.mkdirSync(upload,{recursive:true});


const allowedOrigins=[
  "http://localhost:5000",
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

// MongoDB (optional, for future use)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartsync', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB error:', err));

// Middleware
app.use(cors({
  origin(origin,callback){
    if(!origin || allowedOrigins.includes(origin)){
      return callback(null,true);
    }
    return callback(new Error("Origin not allowed"));
  }
}));

app.use(express.json({limit:"200kb"}));
app.use(bodyParser.urlencoded({
  extended:false,
  limit:"200kb"
}));
app.use(express.static(path.join(path.resolve(), 'Frontend')));

// Middleware to extract API key from headers
app.use((req, res, next) => {
  const userApiKey = req.headers['x-gemini-api-key'];
  if (userApiKey) {
    req.geminiApiKey = userApiKey;
  }
  next();
});
const upload = multer({ storage });

// Routes
app.get('/', showcontroller);
app.use('/upload-chat', rateLimit({
  windows:15*60*100,limit:5
}));
app.use('/chat',  rateLimit({
  windows:15*60*100,limit:30
}));

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
