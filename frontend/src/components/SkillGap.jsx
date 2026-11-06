
import React, { useState } from 'react';
import { analyzeSkillGap } from '../services/api';

export default function SkillGap() {
    const [targetRole, setTargetRole] = useState('Java Developer');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!targetRole.trim()) {
            setError('Please enter a target job role.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setAnalysis(null);

            const result = await analyzeSkillGap(targetRole);
            setAnalysis(result.analysis);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    AI Skill Gap Analyzer
                </h2>
                <p className="text-gray-500 mt-2">
                    Discover the skills you need to achieve your dream IT job.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Enter target role"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
                >
                    {loading ? 'Analyzing...' : 'Analyze Skills'}
                </button>
            </div>

            {error && (
                <p className="text-red-600 mt-4">{error}</p>
            )}

            {analysis && (
                <div className="mt-8 space-y-6">

                    <div className="bg-blue-50 p-4 rounded-xl">
                        <h3 className="font-bold text-lg text-blue-800">
                            Analysis Summary
                        </h3>
                        <p className="text-gray-700 mt-2">
                            {analysis.summary}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-3">
                            Matched Skills
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {analysis.matchedSkills?.map((skill, index) => (
                                <span
                                    key={index}
                                    className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm"
                                >
                                    ✓ {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-3">
                            Missing Skills
                        </h3>

                        <div className="space-y-3">
                            {analysis.missingSkills?.map((item, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-xl p-4"
                                >
                                    <div className="flex flex-wrap justify-between gap-2">
                                        <h4 className="font-semibold text-gray-800">
                                            {item.skill}
                                        </h4>

                                        <span className={`text-sm font-semibold ${
                                            item.priority === 'High'
                                                ? 'text-red-600'
                                                : item.priority === 'Medium'
                                                ? 'text-orange-600'
                                                : 'text-green-600'
                                        }`}>
                                            {item.priority} Priority
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mt-2">
                                        {item.reason}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-3">
                            Learning Recommendations
                        </h3>

                        <ul className="space-y-2">
                            {analysis.recommendations?.map((item, index) => (
                                <li
                                    key={index}
                                    className="bg-gray-50 p-3 rounded-lg text-gray-700"
                                >
                                    {index + 1}. {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </section>
    );
}
