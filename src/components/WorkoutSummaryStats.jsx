// src/components/WorkoutSummaryStats.jsx
import React from 'react';
import { Dumbbell, Weight, Flame } from 'lucide-react';

// This component calculates and displays the summary stats for the day.
const WorkoutSummaryStats = ({ stats }) => {
    // If there are no stats, don't render anything.
    if (!stats || stats.exerciseCount === 0) {
        return null;
    }

    return (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Exercises</div>
                    <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                        <Dumbbell className="text-cyan-400" size={20}/>
                        {stats.exerciseCount}
                    </div>
                </div>
                {/* Only show Volume if it's greater than 0 */}
                {stats.totalVolume > 0 && 
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Volume</div>
                        <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            <Weight className="text-cyan-400" size={20}/>
                            {stats.totalVolume.toLocaleString()} <span className="text-base font-normal text-gray-400">kg</span>
                        </div>
                    </div>
                }
                {/* Only show Calories if they are greater than 0 */}
                {stats.totalCalories > 0 &&
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Calories</div>
                        <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            <Flame className="text-amber-400" size={20}/>
                            {stats.totalCalories}
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default WorkoutSummaryStats;
