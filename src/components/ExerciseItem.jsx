// src/components/ExerciseItem.jsx
import React, { useState, useMemo } from 'react';
import { ChevronsUpDown, Pencil, Undo2, Flame, PlusCircle, Trash2, Info, ImageOff } from 'lucide-react';

const bodyPartColors = {
    'Chest': 'bg-blue-500',
    'Back': 'bg-green-500',
    'Legs': 'bg-red-500',
    'Shoulders': 'bg-yellow-500',
    'Arms': 'bg-purple-500',
    'Core': 'bg-pink-500',
    'Full Body': 'bg-indigo-500',
    'Cardio': 'bg-teal-500',
    'Other': 'bg-gray-500',
    'Flexibility': 'bg-orange-500',
};

const ExerciseItem = ({ exercise, onUpdate, onSetUpdate, onComplete, onUndo, onEdit, onStartRest, onAddSet, onDeleteSet, onShowVisualAid }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedRest, setSelectedRest] = useState(60);
    const [imageError, setImageError] = useState(false);

    const completedSetsCount = useMemo(() => {
        return exercise.actualSets?.filter(set => set.completed).length || 0;
    }, [exercise.actualSets]);

    const handleExpandClick = () => {
        if (!isExpanded && exercise.type === 'strength' && (!exercise.actualSets || exercise.actualSets.length === 0)) {
            const numSets = parseInt(exercise.targetSets) || 0;
            const reps = exercise.targetReps?.split('-')[0].trim() || '12';
            const weight = exercise.targetWeightValue || '';
            const defaultSets = Array.from({ length: numSets }, () => ({ reps, weight, completed: false }));
            onUpdate(exercise.id, { actualSets: defaultSets });
        }
        setIsExpanded(!isExpanded);
    };
    
    const handleSetComplete = (setIndex) => {
        const newActualSets = [...(exercise.actualSets || [])];
        if (newActualSets[setIndex]) {
            newActualSets[setIndex] = { ...newActualSets[setIndex], completed: !newActualSets[setIndex].completed };
            onUpdate(exercise.id, { actualSets: newActualSets });
            if (newActualSets[setIndex].completed) {
                onStartRest(selectedRest);
            }
        }
    };

    const exerciseType = exercise.type?.toLowerCase() || 'strength';
    
    const statusClass = {
        'completed-over': 'border-l-green-500',
        'completed': 'border-l-green-500',
        'completed-under': 'border-l-orange-500',
        'skipped': 'border-l-red-500',
    }[exercise.status] || 'border-l-gray-700';

    return (
        <div className={`bg-gray-800 rounded-lg shadow-md border-l-4 ${statusClass} transition-colors duration-300`}>
            <div className="p-4">
                 <div className="flex items-start space-x-4">
                    <input 
                        type="checkbox" 
                        checked={exercise.status !== 'pending'} 
                        onChange={() => onComplete(exercise.id)} 
                        className="form-checkbox h-7 w-7 mt-1 bg-gray-700 border-gray-600 rounded text-cyan-500 focus:ring-cyan-500/50 cursor-pointer" 
                        disabled={exercise.status !== 'pending'} 
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
                                <span className={`text-xs text-white font-semibold px-2 py-1 rounded-full ${bodyPartColors[exercise.bodyPart] || 'bg-gray-500'}`}>
                                    {exercise.bodyPart}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => onShowVisualAid(exercise)} className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 hover:ring-2 hover:ring-cyan-400">
                                    {exercise.imageUrl && !imageError ? (
                                        <img src={exercise.imageUrl} alt={exercise.name} className="h-full w-full object-cover" onError={() => setImageError(true)} />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <Info size={16} className="text-gray-400"/>
                                        </div>
                                    )}
                                </button>
                                {exercise.status === 'pending' && <button onClick={() => onEdit(exercise)} className="p-1 text-gray-500 hover:text-cyan-400"><Pencil size={18} /></button>}
                                {exercise.status !== 'pending' && <button onClick={() => onUndo(exercise.id)} className="p-1 text-gray-500 hover:text-cyan-400" title="Undo"><Undo2 size={20} /></button>}
                                <button onClick={handleExpandClick} className="p-1 text-gray-500 hover:text-cyan-400"><ChevronsUpDown size={20} /></button>
                            </div>
                        </div>
                        
                        <div className="mt-2 p-3 bg-gray-900/50 rounded-md">
                             <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    {/* --- UPDATED: "Target" label added --- */}
                                    <div className="text-xs text-gray-400">Target Sets</div>
                                    <div className="text-lg font-bold text-white">
                                        {completedSetsCount} / {exercise.targetSets}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Target Reps</div>
                                    <div className="text-lg font-bold text-white">{exercise.targetReps}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Target Weight</div>
                                    <div className="text-lg font-bold text-white">{exercise.targetWeight || 'Bodyweight'}</div>
                                </div>
                            </div>

                            {isExpanded && exerciseType === 'strength' && (
                                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                                    <div className="flex items-center justify-end gap-2 mb-2">
                                        <span className="text-xs text-gray-400">Rest:</span>
                                        {[30, 45, 60, 90, 120].map(duration => (
                                            <button key={duration} onClick={() => setSelectedRest(duration)} className={`text-xs px-2 py-1 rounded-md ${selectedRest === duration ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                                {duration}s
                                            </button>
                                        ))}
                                    </div>

                                    {Array.from({ length: exercise.actualSets?.length || parseInt(exercise.targetSets) || 0 }).map((_, setIndex) => (
                                        <div key={setIndex} className="grid grid-cols-[auto,1fr,1fr,auto,auto] gap-x-3 items-center">
                                            <span className="text-sm font-medium text-gray-400">Set {setIndex + 1}</span>
                                            <input type="number" value={exercise.actualSets?.[setIndex]?.reps ?? ''} onChange={e => onSetUpdate(exercise.id, setIndex, 'reps', e.target.value)} placeholder={exercise.targetReps?.split('-')[0].trim() || 'Reps'} className="bg-gray-700 p-2 rounded w-full text-center" disabled={exercise.status !== 'pending'} />
                                            <input type="number" value={exercise.actualSets?.[setIndex]?.weight ?? ''} onChange={e => onSetUpdate(exercise.id, setIndex, 'weight', e.target.value)} placeholder={`${exercise.targetWeightValue || '0'} kg`} className="bg-gray-700 p-2 rounded w-full text-center" disabled={exercise.status !== 'pending'} step="0.5" />
                                            <input type="checkbox" checked={exercise.actualSets?.[setIndex]?.completed || false} onChange={() => handleSetComplete(setIndex)} className="form-checkbox h-5 w-5 bg-gray-600 border-gray-500 rounded text-cyan-500 focus:ring-cyan-500/50 cursor-pointer" disabled={exercise.status !== 'pending'}/>
                                            <button onClick={() => onDeleteSet(exercise.id, setIndex)} className="text-red-500 hover:text-red-400 disabled:opacity-50" disabled={exercise.status !== 'pending'}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex justify-center mt-2">
                                        <button onClick={() => onAddSet(exercise.id)} className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50" disabled={exercise.status !== 'pending'}>
                                            <PlusCircle size={16} className="mr-2"/>
                                            Duplicate Last Set
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                         {/* --- NEW: Calorie display --- */}
                         {exercise.calories && (
                            <div className="text-xs text-amber-400 flex items-center justify-end mt-2">
                                <Flame size={12} className="mr-1"/>~{exercise.calories} kcal
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseItem;
