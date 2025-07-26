// src/components/EditWorkoutExerciseModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const EditWorkoutExerciseModal = ({ exercise, onSave, onClose }) => {
    const [editedExercise, setEditedExercise] = useState(exercise);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedExercise(exercise);
    }, [exercise]);

    const handleFieldChange = (field, value) => {
        setEditedExercise(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const weightValue = parseFloat(editedExercise.targetWeight) || 0;
        await onSave({ ...editedExercise, targetWeightValue: weightValue });
        setIsSaving(false);
        onClose();
    };

    const exerciseType = editedExercise.metricType?.toLowerCase() || 'strength';

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-4">Edit Workout</h2>
                <p className="text-lg text-cyan-400 mb-6">{editedExercise.name}</p>
                
                <div className="space-y-4">
                    {/* --- UPDATED: Conditional rendering for all exercise types --- */}
                    {(exerciseType === 'weight_reps' || exerciseType === 'bodyweight') && (
                        <>
                            <div><label className="text-xs text-gray-400">Target Sets</label><input type="text" value={editedExercise.targetSets || ''} onChange={e => handleFieldChange('targetSets', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                            <div><label className="text-xs text-gray-400">Target Reps</label><input type="text" value={editedExercise.targetReps || ''} onChange={e => handleFieldChange('targetReps', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                            {exerciseType === 'weight_reps' && (
                                <div><label className="text-xs text-gray-400">Target Weight (kg)</label><input type="text" value={editedExercise.targetWeight || ''} onChange={e => handleFieldChange('targetWeight', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" placeholder="e.g., 40" /></div>
                            )}
                        </>
                    )}
                    {exerciseType === 'time_distance' && (
                         <>
                            <div><label className="text-xs text-gray-400">Target Time (min)</label><input type="number" value={editedExercise.targetTime || ''} onChange={e => handleFieldChange('targetTime', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                            <div><label className="text-xs text-gray-400">Target Distance ({editedExercise.defaultUnit})</label><input type="number" value={editedExercise.targetDistance || ''} onChange={e => handleFieldChange('targetDistance', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" step="0.1" /></div>
                        </>
                    )}
                    {exerciseType === 'time' && (
                         <>
                            <div><label className="text-xs text-gray-400">Target Time ({editedExercise.defaultUnit})</label><input type="number" value={editedExercise.targetTime || ''} onChange={e => handleFieldChange('targetTime', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                        </>
                    )}
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="bg-gray-600 px-4 py-3 rounded">Cancel</button>
                    <button onClick={handleSave} className="bg-cyan-600 px-4 py-3 rounded w-36 flex justify-center items-center" disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditWorkoutExerciseModal;
