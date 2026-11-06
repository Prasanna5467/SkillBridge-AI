
import React, { useState } from 'react';

import {
  generateInterviewQuestions,
  evaluateInterviewAnswer
} from '../services/api';

function InterviewPrep() {
  const [topic, setTopic] = useState('Java');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [count, setCount] = useState(5);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');

  const [evaluation, setEvaluation] = useState(null);
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');

  const [interviewStarted, setInterviewStarted] = useState(false);

  // Start interview
  const handleStartInterview = async () => {
    setLoading(true);
    setError('');

    setQuestions([]);
    setCurrentIndex(0);
    setAnswer('');
    setEvaluation(null);
    setResults([]);
    setInterviewStarted(false);

    try {
      const data = await generateInterviewQuestions(
        topic,
        difficulty,
        Number(count)
      );

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions were generated. Please try again.');
      }

      setQuestions(data.questions);
      setInterviewStarted(true);

    } catch (err) {
      setError(err.message || 'Unable to start interview.');
    } finally {
      setLoading(false);
    }
  };

  // Evaluate current answer
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || evaluating) return;

    setEvaluating(true);
    setError('');

    try {
      const data = await evaluateInterviewAnswer(
        topic,
        questions[currentIndex].question,
        answer
      );

      if (!data.evaluation) {
        throw new Error('AI evaluation was not received.');
      }

      setEvaluation(data.evaluation);

      setResults((previous) => [
        ...previous,
        {
          question: questions[currentIndex].question,
          answer,
          evaluation: data.evaluation
        }
      ]);

    } catch (err) {
      setError(err.message || 'Unable to evaluate your answer.');
    } finally {
      setEvaluating(false);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    setCurrentIndex((previous) => previous + 1);
    setAnswer('');
    setEvaluation(null);
    setError('');
  };

  // Restart interview
  const handleRestart = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setAnswer('');
    setEvaluation(null);
    setResults([]);
    setInterviewStarted(false);
    setError('');
  };

  const currentQuestion = questions[currentIndex];

  const isCompleted =
    interviewStarted && currentIndex >= questions.length;

  const averageScore =
    results.length > 0
      ? (
          results.reduce(
            (total, item) => total + Number(item.evaluation.score),
            0
          ) / results.length
        ).toFixed(1)
      : '0';

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-7">

        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl">
          🎯
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            AI Interview Preparation
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Practice technical interviews with your personal AI interviewer.
          </p>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-5 text-sm">
          {error}
        </div>
      )}

      {/* Interview Setup */}
      {!interviewStarted && (
        <div className="bg-gray-50 rounded-2xl p-5 md:p-7">

          <h3 className="text-lg font-bold text-gray-900 mb-5">
            Configure Your Interview
          </h3>

          <div className="grid md:grid-cols-3 gap-5">

            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Subject
              </label>

              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full border border-gray-300 bg-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Java">Java</option>
                <option value="Python">Python</option>
                <option value="SQL">SQL</option>
                <option value="OOP">Object Oriented Programming</option>
                <option value="DBMS">DBMS</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Data Structures and Algorithms">
                  Data Structures and Algorithms
                </option>
                <option value="JavaScript">JavaScript</option>
                <option value="React.js">React.js</option>
                <option value="Node.js">Node.js</option>
                <option value="MongoDB">MongoDB</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Difficulty Level
              </label>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-gray-300 bg-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Questions
              </label>

              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full border border-gray-300 bg-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

          </div>

          <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-sm text-indigo-800">
              <strong>How it works:</strong> AI generates interview questions.
              You submit your answers and receive a score, feedback,
              ideal answer and improvement tips.
            </p>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={loading}
            className="mt-6 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition disabled:opacity-60"
          >
            {loading ? 'Generating Questions...' : 'Start AI Interview →'}
          </button>

        </div>
      )}

      {/* Active Interview */}
      {interviewStarted && !isCompleted && currentQuestion && (
        <div>

          {/* Progress */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-indigo-700">
              Question {currentIndex + 1} of {questions.length}
            </span>

            <span className="text-sm text-gray-500">
              {topic} • {difficulty}
            </span>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full mb-7 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`
              }}
            />
          </div>

          {/* Question */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-6">

            <p className="text-sm font-semibold text-indigo-600 mb-3">
              AI INTERVIEW QUESTION
            </p>

            <h3 className="text-xl font-bold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h3>

          </div>

          {/* Answer */}
          {!evaluation && (
            <div>

              <label className="block font-semibold text-gray-800 mb-3">
                Your Answer
              </label>

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                placeholder="Write your answer here..."
                disabled={evaluating}
                className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 resize-y disabled:bg-gray-100"
              />

              <div className="flex flex-wrap justify-between items-center gap-3 mt-4">

                <p className="text-xs text-gray-400">
                  Explain your answer clearly with examples wherever possible.
                </p>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || evaluating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {evaluating ? 'AI Evaluating...' : 'Submit Answer'}
                </button>

              </div>

            </div>
          )}

          {/* AI Evaluation */}
          {evaluation && (
            <div className="space-y-5">

              {/* Score */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">

                <div>
                  <p className="text-sm text-green-700 font-semibold">
                    YOUR AI EVALUATION
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-1">
                    {evaluation.verdict}
                  </h3>
                </div>

                <div className="text-center">
                  <p className="text-4xl font-bold text-green-700">
                    {evaluation.score}/10
                  </p>

                  <p className="text-xs text-gray-500">
                    Your score
                  </p>
                </div>

              </div>

              {/* Correctness */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h4 className="font-bold text-gray-900 mb-2">
                  Answer Analysis
                </h4>

                <p className="text-gray-600 text-sm leading-7 whitespace-pre-wrap">
                  {evaluation.correctness}
                </p>
              </div>

              {/* Feedback */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h4 className="font-bold text-gray-900 mb-2">
                  AI Feedback
                </h4>

                <p className="text-gray-600 text-sm leading-7 whitespace-pre-wrap">
                  {evaluation.feedback}
                </p>
              </div>

              {/* Ideal Answer */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h4 className="font-bold text-blue-900 mb-2">
                  Ideal Answer
                </h4>

                <p className="text-blue-900 text-sm leading-7 whitespace-pre-wrap">
                  {evaluation.ideal_answer}
                </p>
              </div>

              {/* Improvement Tips */}
              <div className="border border-gray-200 rounded-xl p-5">
                <h4 className="font-bold text-gray-900 mb-3">
                  Improvement Suggestions
                </h4>

                <ul className="space-y-2">
                  {Array.isArray(evaluation.improvement_tips) &&
                    evaluation.improvement_tips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex gap-2 text-sm text-gray-600"
                      >
                        <span className="text-indigo-600 font-bold">✓</span>
                        {tip}
                      </li>
                    ))}
                </ul>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextQuestion}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold"
              >
                {currentIndex === questions.length - 1
                  ? 'View Interview Results →'
                  : 'Next Question →'}
              </button>

            </div>
          )}

        </div>
      )}

      {/* Interview Completed */}
      {isCompleted && (
        <div className="text-center py-8">

          <div className="text-6xl mb-4">
            🏆
          </div>

          <h3 className="text-2xl font-bold text-gray-900">
            Interview Completed!
          </h3>

          <p className="text-gray-500 mt-2">
            Great effort! Here is your performance summary.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mt-8 mb-8">

            <div className="bg-indigo-50 rounded-2xl p-5">
              <p className="text-sm text-gray-500">
                Subject
              </p>

              <p className="text-xl font-bold text-indigo-700 mt-2">
                {topic}
              </p>
            </div>

            <div className="bg-green-50 rounded-2xl p-5">
              <p className="text-sm text-gray-500">
                Questions Answered
              </p>

              <p className="text-3xl font-bold text-green-700 mt-2">
                {results.length}
              </p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-5">
              <p className="text-sm text-gray-500">
                Average Score
              </p>

              <p className="text-3xl font-bold text-purple-700 mt-2">
                {averageScore}/10
              </p>
            </div>

          </div>

          <div className="text-left border border-gray-200 rounded-xl p-5 mb-6">
            <h4 className="font-bold text-gray-900 mb-4">
              Question-wise Performance
            </h4>

            <div className="space-y-3">
              {results.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start gap-3 border-b border-gray-100 pb-3"
                >
                  <p className="text-sm text-gray-700 flex-1">
                    <strong>Q{index + 1}.</strong> {item.question}
                  </p>

                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                    {item.evaluation.score}/10
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Start Another Interview
          </button>

        </div>
      )}

    </section>
  );
}

export default InterviewPrep;
