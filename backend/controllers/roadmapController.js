const axios = require('axios');
const User = require('../models/User');

const generateRoadmap = async (req, res) => {
  try {
    // Get the logged-in user's profile
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send user information to Python AI service
    const response = await axios.post(
      'http://127.0.0.1:8000/api/roadmap/generate',
      {
        careerGoal: user.careerGoal,
        skills: user.skills,
        experienceLevel: user.experienceLevel
      }
    );

    // Return the generated roadmap
    res.status(200).json(response.data);

  } catch (error) {
    console.error('Roadmap generation error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to generate career roadmap'
    });
  }
};

module.exports = { generateRoadmap };