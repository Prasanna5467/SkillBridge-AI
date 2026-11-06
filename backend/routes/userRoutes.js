
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  getProfile,
  updateProfile
} = require('../controllers/userController');

// Get profile
router.get('/profile', protect, getProfile);

// Update profile
router.put('/profile', protect, updateProfile);

module.exports = router;
