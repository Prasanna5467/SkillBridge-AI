
const API_URL = 'http://localhost:5000/api';

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
};

export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};
export const getProfile = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch profile');
  }

  return data;
};
export const updateProfile = async (profileData) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Profile update failed');
  }

  return data;
};
export const generateRoadmap = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_URL}/roadmap/generate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to generate roadmap');
  }

  return data;
};

export const chatWithMentor = async (question, history = []) => {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_URL}/mentor/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        question,
        history
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to communicate with AI Mentor'
    );
  }

  return data;
};

// Generate AI interview questions
export const generateInterviewQuestions = async (
  topic,
  difficulty = 'Intermediate',
  count = 5
) => {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_URL}/interview/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        topic,
        difficulty,
        count
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to generate questions');
  }

  return data;
};


// Evaluate an interview answer
export const evaluateInterviewAnswer = async (
  topic,
  question,
  answer
) => {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_URL}/interview/evaluate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        topic,
        question,
        answer
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to evaluate answer');
  }

  return data;
};

export const analyzeSkillGap = async (targetRole) => {
    const token = localStorage.getItem('token');

    const response = await fetch(
        `${API_URL}/skill-gap/analyze`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ targetRole })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.error || 'Skill analysis failed');
    }

    return data;
};

