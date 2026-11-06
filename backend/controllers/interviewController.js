
const axios = require('axios');
const User = require('../models/User');

const AI_SERVICE_URL = 'http://127.0.0.1:8000';

// Generate interview questions
const generateInterviewQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { topic, difficulty = 'Intermediate', count = 5 } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please select an interview topic'
      });
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/interview/generate`,
      {
        topic,
        difficulty,
        count
      },
      { timeout: 200000 }
    );

    res.status(200).json(response.data);

  } catch (error) {
    console.error(
      'Interview question generation error:',
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.detail ||
        'Unable to generate interview questions'
    });
  }
};


// Evaluate interview answer
const evaluateInterviewAnswer = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { topic, question, answer } = req.body;

    if (!topic || !question || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic, question and answer are required'
      });
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/interview/evaluate`,
      {
        topic,
        question,
        answer
      },
      { timeout: 200000 }
    );

    res.status(200).json(response.data);

  } catch (error) {
    console.error(
      'Interview evaluation error:',
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.detail ||
        'Unable to evaluate your answer'
    });
  }
};


module.exports = {
  generateInterviewQuestions,
  evaluateInterviewAnswer
};
