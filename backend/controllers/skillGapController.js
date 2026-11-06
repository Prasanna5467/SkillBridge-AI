
const axios = require('axios');
const User = require('../models/User');

const analyzeSkillGap = async (req, res) => {
    try {
        const { targetRole } = req.body;

        if (!targetRole || !targetRole.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Target role is required'
            });
        }

        // Get logged-in user's profile
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Send profile data to FastAPI
        const response = await axios.post(
            'http://127.0.0.1:8000/api/skill-gap/analyze',
            {
                targetRole: targetRole,
                currentSkills: user.skills || [],
                experienceLevel: user.experienceLevel || 'Beginner'
            },
            {
                timeout: 200000
            }
        );

        return res.status(200).json(response.data);

    } catch (error) {
        console.error(
            'Skill Gap Error:',
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: 'Unable to analyze skill gap',
            error: error.response?.data?.detail || error.message
        });
    }
};

module.exports = { analyzeSkillGap };
