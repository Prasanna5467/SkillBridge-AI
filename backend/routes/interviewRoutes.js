
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  generateInterviewQuestions,
  evaluateInterviewAnswer
} = require('../controllers/interviewController');

// Protected interview routes
router.post('/generate', protect, generateInterviewQuestions);
router.post('/evaluate', protect, evaluateInterviewAnswer);

module.exports = router;
