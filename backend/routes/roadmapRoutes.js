const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  generateRoadmap
} = require('../controllers/roadmapController');

// Protected route: only logged-in users can generate roadmaps
router.post('/generate', protect, generateRoadmap);

module.exports = router;