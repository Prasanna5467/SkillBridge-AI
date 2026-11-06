
import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'skillbridge_learning_tasks';

export default function ProgressTracker() {
    const [tasks, setTasks] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
                { id: 1, title: 'Practice Java and OOP', completed: false },
                { id: 2, title: 'Learn SQL and DBMS', completed: false },
                { id: 3, title: 'Practice Data Structures', completed: false },
                { id: 4, title: 'Build REST APIs', completed: false },
                { id: 5, title: 'Practice interview questions', completed: false }
            ];
        } catch {
            return [];
        }
    });

    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    const completed = tasks.filter(task => task.completed).length;
    const percentage = tasks.length
        ? Math.round((completed / tasks.length) * 100)
        : 0;

    const addTask = () => {
        if (!newTask.trim()) return;

        setTasks(prev => [
            ...prev,
            {
                id: Date.now(),
                title: newTask.trim(),
                completed: false
            }
        ]);

        setNewTask('');
    };

    const toggleTask = (id) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    return (
        <section className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-800">
                Learning Progress Tracker
            </h2>

            <p className="text-gray-500 mt-2">
                Set learning goals and track your preparation progress.
            </p>

            <div className="mt-6 bg-blue-50 rounded-xl p-5">
                <div className="flex justify-between mb-3">
                    <span className="font-semibold text-gray-700">
                        Overall Progress
                    </span>
                    <span className="font-bold text-blue-600">
                        {percentage}%
                    </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <p className="text-sm text-gray-600 mt-3">
                    {completed} of {tasks.length} goals completed
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <input
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    placeholder="Add a new learning goal..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
                />

                <button
                    onClick={addTask}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                    Add Goal
                </button>
            </div>

            <div className="mt-6 space-y-3">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className="flex items-center gap-3 border rounded-lg p-4"
                    >
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="w-5 h-5"
                        />

                        <span className={`flex-1 ${
                            task.completed
                                ? 'line-through text-gray-400'
                                : 'text-gray-700'
                        }`}>
                            {task.title}
                        </span>

                        <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Delete ${task.title}`}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
