
const axios = require('axios');
const User = require('../models/User');

const chatWithMentor = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { question, history = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a question.'
      });
    }

    const response = await axios.post(
      'http://127.0.0.1:8000/api/mentor/chat',
      {
        question,
        careerGoal: user.careerGoal,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        history
      }
    );

    return res.status(200).json(response.data);

  } catch (error) {
    console.error('AI Mentor Error:', error.message);

    return res.status(
      error.response?.status || 500
    ).json({
      success: false,
      message:
        error.response?.data?.detail ||
        'Failed to communicate with AI Mentor.'
    });
  }
};

module.exports = { chatWithMentor };
