
import React, { useEffect, useState } from 'react';
import InterviewPrep from './components/InterviewPrep';
import SkillGap from './components/SkillGap';
import ProgressTracker from './components/ProgressTracker';

import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  generateRoadmap,
  chatWithMentor
} from './services/api';

function App() {
  // Authentication
  const [page, setPage] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dark mode preference
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('skillbridge-theme') === 'dark'
  );

  useEffect(() => {
    localStorage.setItem('skillbridge-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Authentication form
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    education: '',
    careerGoal: '',
    experienceLevel: 'Beginner'
  });

  // User profile
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    education: '',
    skills: '',
    careerGoal: '',
    experienceLevel: 'Beginner'
  });
  const [profileMessage, setProfileMessage] = useState('');

  // Roadmap
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState('');

  // AI Mentor chatbot
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  // General messages
  const [dashboardError, setDashboardError] = useState('');

  // Handle authentication input
  const handleAuthChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle profile input
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  // Fetch profile after login
  useEffect(() => {
    if (token && page === 'dashboard') {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page]);

  const loadProfile = async () => {
    setProfileLoading(true);
    setDashboardError('');

    try {
      const result = await getProfile();
      const user = result.user || result.profile || result;

      setProfile(user);

      setProfileForm({
        education: user.education || '',
        skills: Array.isArray(user.skills)
          ? user.skills.join(', ')
          : user.skills || '',
        careerGoal: user.careerGoal || '',
        experienceLevel: user.experienceLevel || 'Beginner'
      });
    } catch (error) {
      setDashboardError(error.message || 'Unable to load profile.');

      if (
        error.message?.toLowerCase().includes('token') ||
        error.message?.toLowerCase().includes('unauthorized')
      ) {
        handleLogout();
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();

    setAuthLoading(true);
    setAuthError('');

    try {
      const result = await registerUser(authForm);

      if (result.token) {
        localStorage.setItem('token', result.token);
        setToken(result.token);
        setPage('dashboard');
      } else {
        setPage('login');
        setAuthError('Registration successful. Please log in.');
      }
    } catch (error) {
      setAuthError(error.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();

    setAuthLoading(true);
    setAuthError('');

    try {
      const result = await loginUser({
        email: authForm.email,
        password: authForm.password
      });

      if (!result.token) {
        throw new Error('Login response did not contain a token.');
      }

      localStorage.setItem('token', result.token);
      setToken(result.token);
      setPage('dashboard');
    } catch (error) {
      setAuthError(error.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');

    setToken('');
    setProfile(null);
    setRoadmap(null);
    setChatHistory([]);
    setChatInput('');
    setChatError('');

    setPage('login');
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setProfileMessage('');

    try {
      const updatedData = {
        education: profileForm.education,
        skills: profileForm.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        careerGoal: profileForm.careerGoal,
        experienceLevel: profileForm.experienceLevel
      };

      await updateProfile(updatedData);

      setProfile({
        ...profile,
        ...updatedData
      });

      setProfileMessage('Profile updated successfully!');
      setProfileEditing(false);
    } catch (error) {
      setProfileMessage(error.message || 'Profile update failed.');
    }
  };

  // Generate AI roadmap
  const handleGenerateRoadmap = async () => {
    setRoadmapLoading(true);
    setRoadmapError('');
    setRoadmap(null);

    try {
      const result = await generateRoadmap();

      setRoadmap(
        result.roadmap ||
        result.data ||
        result
      );
    } catch (error) {
      setRoadmapError(error.message || 'Unable to generate roadmap.');
    } finally {
      setRoadmapLoading(false);
    }
  };

  // Send message to AI Career Mentor
  const handleSendMessage = async (e) => {
    e.preventDefault();

    const question = chatInput.trim();

    if (!question || chatLoading) return;

    const previousHistory = chatHistory;

    const updatedHistory = [
      ...previousHistory,
      {
        role: 'user',
        content: question
      }
    ];

    setChatHistory(updatedHistory);
    setChatInput('');
    setChatLoading(true);
    setChatError('');

    try {
      const result = await chatWithMentor(
        question,
        previousHistory
      );

      setChatHistory([
        ...updatedHistory,
        {
          role: 'assistant',
          content: result.answer
        }
      ]);
    } catch (error) {
      setChatError(error.message || 'Unable to get an AI response.');
    } finally {
      setChatLoading(false);
    }
  };

  // Clear chatbot conversation
  const handleClearChat = () => {
    setChatHistory([]);
    setChatInput('');
    setChatError('');
  };

  // Suggested questions
  const suggestions = [
    'Explain OOP in Java',
    'How should I prepare for IT placements?',
    'Ask me interview questions'
  ];

  // Shared dark mode styles
  const themeStyles = `
    .dark .bg-white {
      background-color: #111827 !important;
    }

    .dark .bg-gray-50 {
      background-color: #1f2937 !important;
    }

    .dark .bg-gray-100 {
      background-color: #374151 !important;
    }

    .dark .bg-indigo-50 {
      background-color: #312e81 !important;
    }

    .dark .text-gray-900,
    .dark .text-gray-800 {
      color: #f9fafb !important;
    }

    .dark .text-gray-700,
    .dark .text-gray-600 {
      color: #d1d5db !important;
    }

    .dark .text-gray-500,
    .dark .text-gray-400 {
      color: #9ca3af !important;
    }

    .dark .border-gray-200,
    .dark .border-gray-300 {
      border-color: #374151 !important;
    }

    .dark input,
    .dark select,
    .dark textarea {
      background-color: #1f2937;
      color: #f9fafb;
      border-color: #4b5563;
    }

    .dark input::placeholder,
    .dark textarea::placeholder {
      color: #9ca3af;
    }

    .dark .hover\\:bg-gray-100:hover {
      background-color: #374151 !important;
    }

    .dark .hover\\:bg-gray-200:hover {
      background-color: #4b5563 !important;
    }
  `;

  // Login and Registration Screen
  if (!token || page !== 'dashboard') {
    return (
      <div
        className={`min-h-screen relative flex items-center justify-center p-5 transition-colors duration-300 ${
          darkMode
            ? 'dark bg-gray-950'
            : 'bg-gradient-to-br from-indigo-100 via-white to-purple-100'
        }`}
      >
        <style>{themeStyles}</style>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => setDarkMode((previous) => !previous)}
          className="absolute top-5 right-5 z-10 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-100"
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        <div
          className={`w-full max-w-md rounded-3xl shadow-xl p-8 ${
            darkMode ? 'bg-gray-900 text-white' : 'bg-white'
          }`}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              S
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              SkillBridge AI
            </h1>

            <p className="text-gray-500 mt-2">
              Your Personalized AI Career Mentor
            </p>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => {
                setPage('login');
                setAuthError('');
              }}
              className={`w-1/2 py-2 rounded-lg font-semibold transition ${
                page === 'login'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600'
              }`}
            >
              Login
            </button>

            <button
              onClick={() => {
                setPage('register');
                setAuthError('');
              }}
              className={`w-1/2 py-2 rounded-lg font-semibold transition ${
                page === 'register'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600'
              }`}
            >
              Register
            </button>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
              {authError}
            </div>
          )}

          <form
            onSubmit={
              page === 'login'
                ? handleLogin
                : handleRegister
            }
            className="space-y-4"
          >
            {page === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={authForm.name}
                    onChange={handleAuthChange}
                    placeholder="Enter your name"
                    required
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education
                  </label>

                  <input
                    type="text"
                    name="education"
                    value={authForm.education}
                    onChange={handleAuthChange}
                    placeholder="e.g. B.E. Computer Engineering"
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Career Goal
                  </label>

                  <input
                    type="text"
                    name="careerGoal"
                    value={authForm.careerGoal}
                    onChange={handleAuthChange}
                    placeholder="e.g. Software Developer"
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>

                  <select
                    name="experienceLevel"
                    value={authForm.experienceLevel}
                    onChange={handleAuthChange}
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={handleAuthChange}
                placeholder="Enter your email"
                required
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={authForm.password}
                onChange={handleAuthChange}
                placeholder="Enter your password"
                required
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
            >
              {authLoading
                ? 'Please wait...'
                : page === 'login'
                  ? 'Login'
                  : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Build your skills. Prepare for placements. Grow your career.
          </p>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? 'dark bg-gray-950 text-gray-100'
          : 'bg-gray-50 text-gray-900'
      }`}
    >
      <style>{themeStyles}</style>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
              S
            </div>

            <div>
              <h1 className="font-bold text-xl text-gray-900">
                SkillBridge AI
              </h1>

              <p className="text-xs text-gray-500">
                Personalized Career Mentor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode((previous) => !previous)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold transition hover:bg-gray-100"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>

            <span className="hidden sm:block text-sm text-gray-600">
              {profile?.name || 'Student'}
            </span>

            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Logout
            </button>
          </div>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 py-8">

        {/* Welcome */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-7 md:p-10 text-white mb-8">

          <p className="text-indigo-100 mb-2">
            YOUR CAREER JOURNEY STARTS HERE
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Welcome, {profile?.name || 'Student'}!
          </h2>

          <p className="text-indigo-100 max-w-2xl">
            Build your technical skills, generate a personalized learning
            roadmap, and prepare for your dream IT job with AI.
          </p>

        </div>

        {dashboardError && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-6">
            {dashboardError}
          </div>
        )}

        {profileLoading && (
          <div className="text-center py-5 text-gray-500">
            Loading your profile...
          </div>
        )}

        {/* Profile Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">

          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                My Career Profile
              </h2>

              <p className="text-sm text-gray-500">
                Your profile helps AI personalize its recommendations.
              </p>
            </div>

            <button
              onClick={() => {
                setProfileEditing(!profileEditing);
                setProfileMessage('');
              }}
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              {profileEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {profileEditing ? (
            <form
              onSubmit={handleUpdateProfile}
              className="grid md:grid-cols-2 gap-4"
            >

              <div>
                <label className="block text-sm font-medium mb-1">
                  Education
                </label>

                <input
                  name="education"
                  value={profileForm.education}
                  onChange={handleProfileChange}
                  className="w-full border rounded-lg p-3"
                  placeholder="Your education"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Career Goal
                </label>

                <input
                  name="careerGoal"
                  value={profileForm.careerGoal}
                  onChange={handleProfileChange}
                  className="w-full border rounded-lg p-3"
                  placeholder="e.g. Software Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Skills
                </label>

                <input
                  name="skills"
                  value={profileForm.skills}
                  onChange={handleProfileChange}
                  className="w-full border rounded-lg p-3"
                  placeholder="Java, Python, SQL"
                />

                <p className="text-xs text-gray-400 mt-1">
                  Separate skills with commas.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Experience Level
                </label>

                <select
                  name="experienceLevel"
                  value={profileForm.experienceLevel}
                  onChange={handleProfileChange}
                  className="w-full border rounded-lg p-3"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Save Profile
                </button>
              </div>

            </form>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Education</p>
                <p className="font-semibold mt-1">
                  {profile?.education || 'Not added'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Career Goal</p>
                <p className="font-semibold mt-1">
                  {profile?.careerGoal || 'Not added'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-semibold mt-1">
                  {profile?.experienceLevel || 'Beginner'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Skills</p>
                <p className="font-semibold mt-1">
                  {Array.isArray(profile?.skills)
                    ? profile.skills.join(', ') || 'Not added'
                    : profile?.skills || 'Not added'}
                </p>
              </div>

            </div>
          )}

          {profileMessage && (
            <p className="text-sm text-indigo-600 mt-4">
              {profileMessage}
            </p>
          )}

        </section>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* AI Roadmap */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center text-2xl">
                <span>🗺️</span>
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  AI Career Roadmap
                </h2>

                <p className="text-sm text-gray-500">
                  Personalized learning plan
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-6 mb-5">
              Get an AI-generated step-by-step roadmap based on your
              career goal, current skills, and experience level.
            </p>

            <button
              onClick={handleGenerateRoadmap}
              disabled={roadmapLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {roadmapLoading
                ? 'Generating with AI...'
                : 'Generate My Roadmap'}
            </button>

            {roadmapError && (
              <p className="text-red-600 text-sm mt-3">
                {roadmapError}
              </p>
            )}

            {roadmap && (
              <div className="mt-6 border-t pt-5">

                <h3 className="font-bold text-lg mb-4">
                  Your Personalized Roadmap
                </h3>

                {typeof roadmap === 'string' ? (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {roadmap}
                  </p>
                ) : (
                  <>
                    {roadmap.title && (
                      <h4 className="font-semibold text-indigo-700 mb-3">
                        {roadmap.title}
                      </h4>
                    )}

                    {Array.isArray(roadmap.steps) ? (
                      <div className="space-y-4">
                        {roadmap.steps.map((step, index) => (
                          <div
                            key={index}
                            className="flex gap-3 bg-gray-50 p-4 rounded-xl"
                          >
                            <div className="w-8 h-8 shrink-0 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {typeof step === 'string'
                                  ? step
                                  : step.title || step.topic || `Step ${index + 1}`}
                              </h4>

                              {typeof step === 'object' && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {step.description || step.details || ''}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {JSON.stringify(roadmap, null, 2)}
                      </pre>
                    )}
                  </>
                )}
              </div>
            )}

          </section>

          {/* Skills Overview */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-2xl">
                <span>💡</span>
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  My Skills
                </h2>

                <p className="text-sm text-gray-500">
                  Your current technical skills
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-5">
              Keep your skills updated to receive better career
              recommendations from SkillBridge AI.
            </p>

            <div className="flex flex-wrap gap-2">
              {Array.isArray(profile?.skills) &&
              profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No skills added yet. Edit your profile to add skills.
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setProfileEditing(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mt-6 text-indigo-600 font-semibold text-sm hover:underline"
            >
              Update my skills →
            </button>

          </section>

          {/* AI Career Mentor Chatbot */}
          <section className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center text-2xl">
                  🤖
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    AI Career Mentor
                  </h2>

                  <p className="text-sm text-green-600">
                    ● Powered by Llama 3.2 AI
                  </p>
                </div>
              </div>

              <button
                onClick={handleClearChat}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Clear Chat
              </button>

            </div>

            {/* Chat Messages */}
            <div className="h-[420px] overflow-y-auto p-5 bg-gray-50">

              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center">

                  <div className="text-5xl mb-4">
                    🤖
                  </div>

                  <h3 className="text-xl font-bold text-gray-800">
                    Hi! I'm your AI Career Mentor.
                  </h3>

                  <p className="text-gray-500 mt-2 max-w-md text-sm">
                    Ask me about programming, technical interviews,
                    IT placements, career planning, or your learning journey.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setChatInput(suggestion)}
                        className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-full text-sm transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                </div>
              )}

              <div className="space-y-4">
                {chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {message.role === 'user'
                          ? 'You'
                          : 'SkillBridge AI'}
                      </p>

                      <p className="text-sm leading-6 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {chatLoading && (
                <div className="flex justify-start mt-4">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-500 animate-pulse">
                      AI is thinking...
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Chat Error */}
            {chatError && (
              <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {chatError}
              </div>
            )}

            {/* Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-5 border-t border-gray-200"
            >
              <div className="flex gap-3">

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything about your career or interviews..."
                  disabled={chatLoading}
                  className="flex-1 min-w-0 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                />

                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chatLoading ? '...' : 'Send'}
                </button>

              </div>

              <p className="text-xs text-gray-400 mt-3 text-center">
                AI responses may occasionally be inaccurate. Verify
                important information.
              </p>
            </form>

          </section>

        </div>

        {/* AI Interview Preparation */}
        <div className="mt-8">
          <InterviewPrep />
        </div>

        {/* AI Skill Gap Analyzer */}
        <div className="mt-8">
          <SkillGap />
        </div>

        {/* Learning Progress Tracker */}
        <div className="mt-8">
          <ProgressTracker />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm py-8">
          © 2026 SkillBridge AI | Your Personal AI Career Mentor
        </footer>

      </main>
    </div>
  );
}

export default App;
