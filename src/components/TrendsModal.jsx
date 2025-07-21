import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper function to format dates for the chart
const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });

const TrendsModal = ({ weeklyPlan, onClose }) => {
    // useMemo will only recalculate the trend data when the weeklyPlan changes
    const trendData = useMemo(() => {
        const exerciseHistory = {};
        // Get all date keys and sort them chronologically
        Object.keys(weeklyPlan).sort().forEach(dateKey => {
            weeklyPlan[dateKey]?.exercises?.forEach(ex => {
                // We only care about completed strength exercises with a weight value
                if (ex.status !== 'pending' && ex.status !== 'skipped' && ex.type === 'strength' && ex.targetWeightValue > 0) {
                    if (!exerciseHistory[ex.name]) {
                        exerciseHistory[ex.name] = [];
                    }
                    // Add the data point for the chart
                    exerciseHistory[ex.name].push({
                        date: formatDate(dateKey),
                        weight: ex.targetWeightValue
                    });
                }
            });
        });
        // Filter out exercises that don't have enough data points to form a trend line
        return Object.entries(exerciseHistory).filter(([, data]) => data.length > 1);
    }, [weeklyPlan]);

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold">Performance Trends</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {trendData.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {trendData.map(([name, data]) => (
                                <div key={name} className="bg-gray-900 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-4 text-center text-white">{name}</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                            <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-lg text-gray-400">Not enough data to show trends.</p>
                            <p className="text-sm text-gray-500">Complete more strength workouts to see your progress.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrendsModal;
