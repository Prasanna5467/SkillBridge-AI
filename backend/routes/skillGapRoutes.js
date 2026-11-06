
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
    analyzeSkillGap
} = require('../controllers/skillGapController');

router.post('/analyze', protect, analyzeSkillGap);

module.exports = router;
