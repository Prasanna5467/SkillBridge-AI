
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  chatWithMentor
} = require('../controllers/mentorController');

router.post('/chat', protect, chatWithMentor);

module.exports = router;
