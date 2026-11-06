
const User = require('../models/User');

// Get logged-in user's profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Profile error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update logged-in user's profile
const updateProfile = async (req, res) => {
  try {
    const { education, skills, careerGoal, experienceLevel } = req.body;

    const allowedLevels = ['Beginner', 'Intermediate', 'Advanced'];

    if (
      experienceLevel !== undefined &&
      !allowedLevels.includes(experienceLevel)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience level'
      });
    }

    if (skills !== undefined && !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be an array'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(education !== undefined && { education }),
        ...(skills !== undefined && {
          skills: skills.map(skill => String(skill).trim()).filter(Boolean)
        }),
        ...(careerGoal !== undefined && { careerGoal }),
        ...(experienceLevel !== undefined && { experienceLevel })
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
