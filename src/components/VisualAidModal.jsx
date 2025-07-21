// src/components/VisualAidModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2, ImageOff, Minimize, Maximize } from 'lucide-react';
import { firebaseConfig } from '../config/firebaseConfig.js';

const VisualAidModal = ({ exercise, cachedDescription, onDescriptionFetched, onClose }) => {
    const [description, setDescription] = useState(cachedDescription || '');
    const [isLoading, setIsLoading] = useState(!cachedDescription && !exercise.description);
    const [error, setError] = useState('');
    const [imageError, setImageError] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false); // --- NEW: State for full-screen view ---

    useEffect(() => {
        // Use the description from the library if it exists
        if (exercise.description) {
            setDescription(exercise.description);
            setIsLoading(false);
            return;
        }
        if (cachedDescription) return;

        const fetchDescription = async () => {
            // This function is a fallback and may not work without a valid API key configured.
            // The primary source of descriptions should be the seeded library.
            // ... (rest of the fetch logic)
            setIsLoading(false);
            setError('Description not found in library.');
        };
        fetchDescription();
    }, [exercise.name, exercise.description, cachedDescription, onDescriptionFetched]);

    return (
        <>
            <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
                <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={24} /></button>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">{exercise.name}</h2>
                        
                        <div 
                            className="mb-4 bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center relative cursor-pointer group"
                            onClick={() => setIsFullScreen(true)} // --- NEW: Click to go full-screen ---
                        >
                            {imageError || !exercise.imageUrl ? (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <ImageOff size={48} />
                                    <span className="text-xs mt-2">Image not available</span>
                                </div>
                            ) : (
                                <>
                                    <img 
                                        src={exercise.imageUrl} 
                                        alt={`${exercise.name} demonstration`} 
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Maximize size={48} className="text-white" />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="min-h-[6rem] bg-gray-900/50 rounded-lg p-4 text-gray-300 flex justify-center items-center">
                            {isLoading ? (
                                <Loader2 className="animate-spin text-cyan-400" />
                            ) : (
                                <p className="text-sm text-center">{error || description}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NEW: Full-screen image overlay --- */}
            {isFullScreen && (
                <div 
                    className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setIsFullScreen(false)}
                >
                    <img 
                        src={exercise.imageUrl} 
                        alt={`${exercise.name} full screen`} 
                        className="max-w-full max-h-full object-contain"
                    />
                     <button className="absolute top-4 right-4 text-white hover:text-gray-300">
                        <Minimize size={28} />
                    </button>
                </div>
            )}
        </>
    );
};

export default VisualAidModal;
