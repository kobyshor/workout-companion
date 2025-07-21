// src/components/AddExerciseModal.jsx
import React, { useState, useMemo } from 'react';
import { useWorkout } from '../contexts/WorkoutContext.jsx';
import { X, Search } from 'lucide-react';

const AddExerciseModal = ({ onAdd, findLastPerformance, onClose }) => {
    const { exerciseLibrary } = useWorkout(); 
    
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [newExerciseDetails, setNewExerciseDetails] = useState({});

    const filteredLibrary = useMemo(() => {
        if (!searchTerm) return exerciseLibrary;
        return exerciseLibrary.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, exerciseLibrary]);

    const handleSelectExercise = (exercise) => {
        const lastPerformance = findLastPerformance(exercise.name);
        setSelectedExercise(exercise);
        setNewExerciseDetails({
            name: exercise.name,
            type: exercise.category?.toLowerCase() || 'strength',
            metricType: exercise.metricType,
            defaultUnit: exercise.defaultUnit,
            targetSets: lastPerformance?.targetSets || '3',
            targetReps: lastPerformance?.targetReps || '12', // --- UPDATED: Default is now '12' ---
            targetWeight: lastPerformance?.targetWeight || '10',
            targetTime: lastPerformance?.targetTime || '30',
            targetDistance: lastPerformance?.targetDistance || '5'
        });
        setStep(2);
    };

    const handleDetailChange = (field, value) => {
        setNewExerciseDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleAdd = () => {
        onAdd(newExerciseDetails);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Select Exercise</h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                            <input 
                                type="text" 
                                placeholder="Search exercises..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="bg-gray-700 p-2 pl-10 rounded w-full"
                            />
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {filteredLibrary.map(ex => (
                                <div key={ex.id} onClick={() => handleSelectExercise(ex)} className="p-3 hover:bg-gray-700 rounded-md cursor-pointer">
                                    <p className="font-semibold">{ex.name}</p>
                                    <p className="text-xs text-gray-400">{ex.bodyPart}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {step === 2 && selectedExercise && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{selectedExercise.name}</h2>
                        <div className="space-y-4">
                            {selectedExercise.metricType === 'weight_reps' && (
                                <>
                                    <div><label className="text-xs text-gray-400">Target Sets</label><input type="text" value={newExerciseDetails.targetSets} onChange={e => handleDetailChange('targetSets', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                                    <div><label className="text-xs text-gray-400">Target Reps</label><input type="text" value={newExerciseDetails.targetReps} onChange={e => handleDetailChange('targetReps', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                                    <div><label className="text-xs text-gray-400">Target Weight (kg)</label><input type="number" value={newExerciseDetails.targetWeight} onChange={e => handleDetailChange('targetWeight', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" step="0.5" /></div>
                                </>
                            )}
                             {selectedExercise.metricType === 'time_distance' && (
                                <>
                                    <div><label className="text-xs text-gray-400">Target Time (min)</label><input type="number" value={newExerciseDetails.targetTime} onChange={e => handleDetailChange('targetTime', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                                    <div><label className="text-xs text-gray-400">Target Distance ({selectedExercise.defaultUnit})</label><input type="number" value={newExerciseDetails.targetDistance} onChange={e => handleDetailChange('targetDistance', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" step="0.1" /></div>
                                </>
                            )}
                            {selectedExercise.metricType === 'bodyweight' && (
                                 <>
                                    <div><label className="text-xs text-gray-400">Target Sets</label><input type="text" value={newExerciseDetails.targetSets} onChange={e => handleDetailChange('targetSets', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                                    <div><label className="text-xs text-gray-400">Target Reps</label><input type="text" value={newExerciseDetails.targetReps} onChange={e => handleDetailChange('targetReps', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                                </>
                            )}
                        </div>
                        <div className="flex justify-between mt-6">
                             <button onClick={() => setStep(1)} className="bg-gray-600 px-4 py-2 rounded">Back</button>
                             <button onClick={handleAdd} className="bg-cyan-600 px-4 py-2 rounded">Add Exercise</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AddExerciseModal;
