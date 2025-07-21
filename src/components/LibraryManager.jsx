// src/components/LibraryManager.jsx
import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Loader2, ImageOff, Pencil, Trash2, Library } from 'lucide-react';
import { useWorkout } from '../contexts/WorkoutContext.jsx';
import ManageExerciseModal from './ManageExerciseModal.jsx';

// --- NEW: Color mapping for body parts ---
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

const LibraryItemCard = ({ exercise, onEdit, onDelete }) => (
    <div className="bg-gray-700 rounded-lg flex flex-col overflow-hidden">
        <div className="w-full h-32 bg-gray-800 flex items-center justify-center relative">
            {exercise.imageUrl ? (
                <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/400x300/1f2937/7dd3fc?text=Image+Error`}} />
            ) : (
                <div className="w-full h-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center">
                    <ImageOff className="text-gray-600" size={40} />
                </div>
            )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-white text-base mb-1">{exercise.name}</h4>
                {/* --- NEW: Color-coded pill --- */}
                <span className={`text-xs text-white font-semibold px-2 py-1 rounded-full ${bodyPartColors[exercise.bodyPart] || 'bg-gray-500'}`}>
                    {exercise.bodyPart}
                </span>
            </div>
            <p className="text-sm text-gray-300 flex-grow mt-2">{exercise.description}</p>
            <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => onEdit(exercise)} className="p-2 text-gray-400 hover:text-white"><Pencil size={16} /></button>
                <button onClick={() => onDelete(exercise.id)} className="p-2 text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
            </div>
        </div>
    </div>
);

const LibraryManager = ({ onClose }) => {
    const { exerciseLibrary, libraryLoading, saveExerciseToLibrary, deleteExerciseFromLibrary } = useWorkout();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [exerciseToEdit, setExerciseToEdit] = useState(null);

    const handleAddNew = () => {
        setExerciseToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (exercise) => {
        setExerciseToEdit(exercise);
        setIsModalOpen(true);
    };

    const handleSave = (exerciseData) => {
        saveExerciseToLibrary(exerciseData);
        setIsModalOpen(false);
        setExerciseToEdit(null);
    };

    const filteredLibrary = useMemo(() => {
        if (!searchTerm) return exerciseLibrary;
        return exerciseLibrary.filter(ex => 
            ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ex.bodyPart.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, exerciseLibrary]);

    return (
        <>
            <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col p-4 sm:p-6 lg:p-8">
                <div className="flex-shrink-0 flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-white">Exercise Library</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={handleAddNew} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                            <Plus size={20} className="mr-2"/> Add New
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={28} /></button>
                    </div>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                    <input 
                        type="text" 
                        placeholder="Search by name or body part..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-lg p-3 pl-12 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>

                <div className="flex-grow overflow-y-auto">
                    {libraryLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="animate-spin text-cyan-400" size={48} />
                        </div>
                    ) : filteredLibrary.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredLibrary.map(ex => (
                                <LibraryItemCard key={ex.id} exercise={ex} onEdit={handleEdit} onDelete={deleteExerciseFromLibrary} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <Library size={64} />
                            <h3 className="text-xl font-semibold mt-4">Library is Empty</h3>
                            <p className="max-w-xs mt-2">No exercises found. Add a new one to get started.</p>
                        </div>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <ManageExerciseModal 
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                    exerciseToEdit={exerciseToEdit}
                />
            )}
        </>
    );
};

export default LibraryManager;
