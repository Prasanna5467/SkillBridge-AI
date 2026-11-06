
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const skillGapRoutes = require('./routes/skillGapRoutes');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://skillbridge-ai-1-wuat.onrender.com',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/skill-gap', skillGapRoutes);

// Home route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillBridge AI Backend is running!'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
