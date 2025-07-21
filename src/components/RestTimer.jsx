// src/components/RestTimer.jsx
import React, { useState, useEffect } from 'react';
import { Timer, X } from 'lucide-react';

// FIX: Renamed the 'key' prop to 'timerId' because 'key' is a reserved prop in React.
const RestTimer = ({ duration, timerId, onFinish }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        setTimeLeft(duration); // Reset time left when duration or timerId changes
        if (duration > 0) {
            const intervalId = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(intervalId);
                        if (typeof onFinish === 'function') {
                            onFinish();
                        }
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [duration, timerId, onFinish]); // Use timerId in the dependency array

    if (timeLeft === 0 || duration === 0) {
        return null;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 border border-cyan-500 text-white py-3 px-6 rounded-full shadow-lg flex items-center space-x-4">
            <Timer className="text-cyan-400" />
            <span className="text-lg font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <button onClick={() => setTimeLeft(0)} className="text-gray-500 hover:text-white">
                <X size={20} />
            </button>
        </div>
    );
};

export default RestTimer;
