// src/components/ManageExerciseModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const ManageExerciseModal = ({ onSave, onClose, exerciseToEdit = null }) => {
    const [exerciseData, setExerciseData] = useState({
        name: '',
        bodyPart: 'Chest',
        metricType: 'weight_reps',
        description: '',
        imageUrl: '',
    });
    const [isSaving, setIsSaving] = useState(false); // --- NEW: Loading state ---

    useEffect(() => {
        if (exerciseToEdit) {
            setExerciseData({
                ...{name: '', bodyPart: 'Chest', metricType: 'weight_reps', description: '', imageUrl: ''},
                ...exerciseToEdit
            });
        }
    }, [exerciseToEdit]);

    const handleInputChange = (field, value) => {
        setExerciseData(prev => ({ ...prev, [field]: value }));
    };

    // --- UPDATED: handleSave is now async ---
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(exerciseData);
        } catch (error) {
            console.error("Failed to save exercise:", error);
            // Optionally, show an error message to the user here
        } finally {
            setIsSaving(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-6">{exerciseToEdit ? 'Edit Exercise' : 'Add New Exercise'}</h2>
                
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Common Fields */}
                    <div>
                        <label className="text-xs text-gray-400">Exercise Name</label>
                        <input type="text" value={exerciseData.name} onChange={e => handleInputChange('name', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Image URL (PNG, GIF)</label>
                        <input type="text" value={exerciseData.imageUrl} onChange={e => handleInputChange('imageUrl', e.target.value)} placeholder="https://..." className="bg-gray-700 p-2 rounded w-full mt-1" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Description</label>
                        <textarea value={exerciseData.description} onChange={e => handleInputChange('description', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1 h-24 resize-none"></textarea>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Body Part</label>
                        <select value={exerciseData.bodyPart} onChange={e => handleInputChange('bodyPart', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1">
                            <option>Chest</option>
                            <option>Back</option>
                            <option>Legs</option>
                            <option>Shoulders</option>
                            <option>Arms</option>
                            <option>Core</option>
                            <option>Full Body</option>
                            <option>Cardio</option>
                            <option>Flexibility</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Exercise Type</label>
                        <select value={exerciseData.metricType} onChange={e => handleInputChange('metricType', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1">
                            <option value="weight_reps">Strength (Weight & Reps)</option>
                            <option value="bodyweight">Strength (Bodyweight)</option>
                            <option value="time_distance">Cardio (Time & Distance)</option>
                            <option value="time">Timed (e.g., Plank)</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
                    {/* --- UPDATED: Save button now shows loading state --- */}
                    <button onClick={handleSave} className="bg-cyan-600 px-4 py-2 rounded w-32 flex justify-center items-center" disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Save Exercise'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageExerciseModal;
