
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const skillGapRoutes = require('./routes/skillGapRoutes');

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  'https://skillbridge-ai-1-wuat.onrender.com',
  'http://localhost:5173'
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an origin (health checks, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware — must come before API routes
app.use(cors(corsOptions));
app.use(express.json());

// Health-check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillBridge AI Backend is running!'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/skill-gap', skillGapRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS blocked this origin'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server after database connection
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`SkillBridge AI server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
