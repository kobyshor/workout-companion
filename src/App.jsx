import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, User, TrendingUp, X, Camera, Info, Undo2, GripVertical, Pencil, Trash2, Plus, ClipboardList, PartyPopper, ClipboardPlus } from 'lucide-react';

// --- MOCK DATA & CONFIG ---
const exerciseVisuals = {
    'Dumbbell Bench Press': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/dumbbell-bench-press.gif',
    'Seated Cable Row': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/seated-cable-row.gif',
    'Incline DB Press': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/incline-dumbbell-press.gif',
    'Lat Pulldown': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/lat-pulldown.gif',
    'Tricep Pushdowns': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/tricep-pushdown.gif',
    'Barbell Bicep Curls': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/barbell-curl.gif',
    'Face Pulls': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/face-pull.gif',
    'Leg Curls': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/leg-curl.gif',
    'Leg Extensions': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/leg-extension.gif',
    'Calf Raises': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/seated-calf-raise.gif',
    'Squats': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/barbell-squat.gif',
    'Bent-Over Dumbbell Raises': 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db-images@main/images/bent-over-dumbbell-raise.gif',
};

const initialPastData = {
    "2025-07-03": ["3 mins skipping", "Leg Curls: 3x12 @ 40kg (hard)", "Leg Extensions: 3x12 @ 35kg", "Calf Raises: 3x20 @ 22.5kg", "Curved Treadmill (Backwards): 3x90s", "Glute Bridges: 3x12", "Abs Circuit: 1x30s each move"],
    "2025-07-09": ["5 mins skipping", "Leg Curls: 3x12 @ 40kg (hard)", "Leg Extensions: 3x12 @ 40kg", "Calf Raises: 3x20 @ 22.5kg", "Curved Treadmill (Backwards): 3x90s", "Glute Bridges: 3x12", "Abs Circuit: 1x30s each move"],
    "2025-07-12": ["Dumbbell Bench Press: 3x12 @ 12kg/hand", "Seated Cable Row: 3x12 @ 40kg", "Incline DB Press: 3x12 @ 12kg/hand", "Lat Pulldown: 3x12 @ 35kg", "Tricep Pushdowns: 3x12 @ 12.5kg", "Barbell Bicep Curls: 3x12 @ 27.5kg", "Face Pulls stopped due to shoulder flare."],
    "2025-07-13": ["30 mins basketball", "Leg Curls: 3x12 @ 45kg", "Leg Extensions: 3x12 @ 45kg", "Squats: 3x12", "Calf Raises: 3x12 @ 27.5kg", "Glute Bridges: 3x12", "Core Routine"],
    "2025-07-15": [
        "Dumbbell Bench Press: 3x12 @ 12.5kg/hand",
        "Seated Cable Row: 3x12 @ 42.5kg",
        "Incline DB Press: 3x12 @ 12.5kg/hand",
        "Lat Pulldown: 3x12 @ 37.5kg",
        "Tricep Pushdowns: 3x12 @ 15kg",
        "Barbell Bicep Curls: 3x12 @ 30kg",
        "Bent-Over Dumbbell Raises: 3x12-15 @ 5kg"
    ]
};

// --- HELPER FUNCTIONS ---
const toYYYYMMDD = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDate = (date) => date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

const parseExerciseString = (line) => {
    const name = line.split(':')[0].trim();
    const base = { id: Math.random(), name, type: 'strength', targetSets: 'N/A', targetReps: 'N/A', targetWeight: 'N/A', targetWeightValue: 0, actualReps: '', actualWeight: '', actualTime: '', actualDistance: '', note: '', status: 'pending', completedTimestamp: null, visualAid: exerciseVisuals[name] || null };
    if (name.includes('skipping') || name.includes('Treadmill') || name.includes('basketball')) base.type = 'cardio';
    if (line.includes('stopped due to')) { base.note = 'Stopped due to' + line.split(' stopped due to')[1]; return base; }
    const parts = line.split(':');
    if (parts.length < 2) return base;
    const details = parts[1].trim();
    const atSplit = details.split('@');
    if (atSplit.length > 1) {
        base.targetWeight = atSplit[1].trim();
        base.targetWeightValue = parseFloat(base.targetWeight) || 0;
    }
    const setsRepsPart = atSplit[0].trim();
    const xSplit = setsRepsPart.split('x');
    if (xSplit.length > 1) { base.targetSets = xSplit[0].trim(); base.targetReps = xSplit[1].trim(); }
    return base;
};

// --- MODAL COMPONENTS ---
const ProfileModal = ({ user, setUser, onClose }) => {
    const [profileData, setProfileData] = useState(user);
    const handleSave = () => { setUser(profileData); onClose(); };
    const handlePicChange = (e) => { if (e.target.files && e.target.files[0]) setProfileData({...profileData, profilePic: URL.createObjectURL(e.target.files[0])}); };
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Profile</h2>
                <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                        <img src={profileData.profilePic || `https://placehold.co/100x100/1f2937/7dd3fc?text=${profileData.name.charAt(0)}`} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                        <label htmlFor="profile-pic-upload" className="absolute bottom-0 right-0 bg-cyan-500 p-1.5 rounded-full cursor-pointer hover:bg-cyan-600"><Camera size={16} /></label>
                        <input id="profile-pic-upload" type="file" className="hidden" accept="image/*" onChange={handlePicChange} />
                    </div>
                    <input type="text" value={profileData.name || ''} onChange={e => setProfileData({...profileData, name: e.target.value})} placeholder="Your Name" className="bg-gray-700 border-gray-600 rounded p-2 text-xl font-bold w-full" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div><label className="text-xs text-gray-400">Height (cm)</label><input type="number" value={profileData.height || ''} onChange={e => setProfileData({...profileData, height: e.target.value})} placeholder="cm" className="bg-gray-700 border-gray-600 rounded p-2 w-full mt-1" /></div>
                    <div><label className="text-xs text-gray-400">Weight (kg)</label><input type="number" value={profileData.weight || ''} onChange={e => setProfileData({...profileData, weight: e.target.value})} placeholder="kg" className="bg-gray-700 border-gray-600 rounded p-2 w-full mt-1" /></div>
                    <div><label className="text-xs text-gray-400">Age</label><input type="number" value={profileData.age || ''} onChange={e => setProfileData({...profileData, age: e.target.value})} placeholder="Age" className="bg-gray-700 border-gray-600 rounded p-2 w-full mt-1" /></div>
                </div>
                <div className="flex justify-end space-x-2"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button><button onClick={handleSave} className="bg-cyan-600 px-4 py-2 rounded">Save</button></div>
            </div>
        </div>
    );
};

const TrendsModal = ({ weeklyPlan, onClose }) => {
    const trendData = useMemo(() => {
        const exerciseHistory = {};
        Object.keys(weeklyPlan).sort().forEach(dateKey => {
            weeklyPlan[dateKey].forEach(ex => {
                if (ex.type === 'strength' && ex.targetWeightValue > 0) {
                    if (!exerciseHistory[ex.name]) exerciseHistory[ex.name] = [];
                    exerciseHistory[ex.name].push({ date: formatDate(new Date(dateKey)), weight: ex.targetWeightValue });
                }
            });
        });
        return Object.entries(exerciseHistory).filter(([, data]) => data.length > 1);
    }, [weeklyPlan]);
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-4xl h-[90vh] overflow-y-auto"><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Performance Trends</h2><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700"><X size={24} /></button></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{trendData.length > 0 ? trendData.map(([name, data]) => (<div key={name} className="bg-gray-900 p-4 rounded-lg"><h3 className="font-semibold mb-4 text-center">{name}</h3><ResponsiveContainer width="100%" height={250}><LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#4b5563" /><XAxis dataKey="date" stroke="#9ca3af" fontSize={12} /><YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} /><Legend /><Line type="monotone" dataKey="weight" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></div>)) : <p className="col-span-full text-center text-gray-400">Not enough data to show trends. Complete more workouts!</p>}</div></div></div>
    );
};

const EditExerciseModal = ({ exercise, onSave, onDelete, onClose }) => {
    const [editedExercise, setEditedExercise] = useState(exercise);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleFieldChange = (field, value) => {
        setEditedExercise(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        const weightValue = parseFloat(editedExercise.targetWeight) || 0;
        onSave({ ...editedExercise, targetWeightValue: weightValue });
        onClose();
    };

    const handleDeleteClick = () => {
        if (confirmDelete) {
            onDelete(exercise.id);
            onClose();
        } else {
            setConfirmDelete(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Edit Exercise</h2>
                <div className="space-y-4">
                    <div><label className="text-xs text-gray-400">Exercise Name</label><input type="text" value={editedExercise.name || ''} onChange={e => handleFieldChange('name', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label className="text-xs text-gray-400">Target Sets</label><input type="text" value={editedExercise.targetSets || ''} onChange={e => handleFieldChange('targetSets', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label className="text-xs text-gray-400">Target Reps</label><input type="text" value={editedExercise.targetReps || ''} onChange={e => handleFieldChange('targetReps', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label className="text-xs text-gray-400">Target Weight</label><input type="text" value={editedExercise.targetWeight || ''} onChange={e => handleFieldChange('targetWeight', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" placeholder="e.g., 40kg" /></div>
                    <div><label className="text-xs text-gray-400">Image URL</label><input type="url" value={editedExercise.visualAid || ''} onChange={e => handleFieldChange('visualAid', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                </div>
                <div className="flex justify-between items-center mt-6">
                    <button onClick={handleDeleteClick} className={`px-4 py-2 rounded flex items-center transition-colors ${confirmDelete ? 'bg-red-600' : 'bg-red-900/50 hover:bg-red-900'}`}>
                        <Trash2 size={16} className="mr-2" /> {confirmDelete ? 'Confirm Delete?' : 'Delete'}
                    </button>
                    <div className="space-x-2">
                        <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
                        <button onClick={handleSave} className="bg-cyan-600 px-4 py-2 rounded">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddExerciseModal = ({ onAdd, onClose }) => {
    const [newExercise, setNewExercise] = useState({ name: '', type: 'strength', targetSets: '', targetReps: '', targetWeight: '', visualAid: '' });
    const handleFieldChange = (field, value) => setNewExercise(prev => ({ ...prev, [field]: value }));
    const handleAdd = () => { onAdd(newExercise); onClose(); };
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add New Exercise</h2>
                <div className="space-y-4">
                    <div><label className="text-xs text-gray-400">Exercise Name</label><input type="text" value={newExercise.name} onChange={e => handleFieldChange('name', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    <div><label className="text-xs text-gray-400">Exercise Type</label><select value={newExercise.type} onChange={e => handleFieldChange('type', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1"><option value="strength">Strength</option><option value="cardio">Cardio</option></select></div>
                    {newExercise.type === 'strength' && (<>
                        <div><label className="text-xs text-gray-400">Target Sets</label><input type="text" value={newExercise.targetSets} onChange={e => handleFieldChange('targetSets', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                        <div><label className="text-xs text-gray-400">Target Reps</label><input type="text" value={newExercise.targetReps} onChange={e => handleFieldChange('targetReps', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                        <div><label className="text-xs text-gray-400">Target Weight</label><input type="text" value={newExercise.targetWeight} onChange={e => handleFieldChange('targetWeight', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                    </>)}
                     <div><label className="text-xs text-gray-400">Image URL (Optional)</label><input type="url" value={newExercise.visualAid} onChange={e => handleFieldChange('visualAid', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div>
                </div>
                <div className="flex justify-end space-x-2 mt-6"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button><button onClick={handleAdd} className="bg-cyan-600 px-4 py-2 rounded">Add Exercise</button></div>
            </div>
        </div>
    );
};

const SummaryModal = ({ summary, onClose, onCopy }) => (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
        <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Workout Summary</h2>
            <textarea readOnly value={summary} className="w-full h-64 bg-gray-900 text-gray-200 rounded-lg p-3 border border-gray-600"></textarea>
            <div className="flex justify-end space-x-2 mt-4"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Close</button><button onClick={onCopy} className="bg-green-600 px-4 py-2 rounded">Copy to Clipboard</button></div>
        </div>
    </div>
);


// --- EXERCISE ITEM COMPONENT ---
const ExerciseItem = ({ exercise, onUpdate, onComplete, onSkip, onUndo, onEdit, onShowVisualAid, trend, onDragStart, onDragOver, onDrop, onDragEnd, isDragging }) => {
    const [note, setNote] = useState(exercise.note);
    const [isSkipping, setIsSkipping] = useState(false);

    const handleNoteBlur = () => {
        if (isSkipping && note.trim() !== '') {
            onSkip(note);
            setIsSkipping(false);
        } else {
            onUpdate({ note });
        }
    };
    
    return (
        <div 
            draggable={exercise.status === 'pending'}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={`bg-gray-800 rounded-lg shadow-md exercise-item transition-all duration-300 status-${exercise.status} ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
            <div className="p-4">
                <div className="flex items-start space-x-2">
                    {exercise.status === 'pending' && <GripVertical className="text-gray-600 mt-2 cursor-grab" />}
                    
                    <input type="checkbox" checked={exercise.status !== 'pending'} onChange={onComplete} className="form-checkbox h-7 w-7 mt-1 bg-gray-700 border-gray-600 rounded text-cyan-500 focus:ring-cyan-500/50 cursor-pointer" disabled={exercise.status !== 'pending'} />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center flex-wrap"><h3 className="text-lg font-semibold text-white">{exercise.name}</h3>{trend}</div>
                            <div className="flex items-center space-x-1">
                                {exercise.visualAid && <button onClick={onShowVisualAid} className="p-1 text-gray-500 hover:text-cyan-400"><Info size={20} /></button>}
                                {exercise.status === 'pending' && <button onClick={onEdit} className="p-1 text-gray-500 hover:text-cyan-400"><Pencil size={18} /></button>}
                                {exercise.status === 'pending' && <button onClick={() => setIsSkipping(true)} className="p-1 text-gray-500 hover:text-red-400"><X size={20} /></button>}
                                {exercise.status !== 'pending' && <button onClick={onUndo} className="p-1 text-gray-500 hover:text-cyan-400" title="Undo"><Undo2 size={20} /></button>}
                            </div>
                        </div>
                        <p className="text-sm text-gray-400">Target: {exercise.targetSets} of {exercise.targetReps} @ {exercise.targetWeight}</p>
                        
                        <div className={`mt-4 space-y-3 ${exercise.status !== 'pending' ? 'opacity-50' : ''}`}>
                            {exercise.type === 'strength' ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" value={exercise.actualReps || ''} onChange={e => onUpdate({ actualReps: e.target.value })} placeholder={exercise.targetReps || 'e.g., 3x12'} className="bg-gray-700 p-2 rounded" disabled={exercise.status !== 'pending'} />
                                    <input type="number" value={exercise.actualWeight || ''} onChange={e => onUpdate({ actualWeight: e.target.value })} placeholder={String(exercise.targetWeightValue)} className="bg-gray-700 p-2 rounded" disabled={exercise.status !== 'pending'} min="0" step="0.5" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" value={exercise.actualTime || ''} onChange={e => onUpdate({ actualTime: e.target.value })} placeholder="Time (min)" className="bg-gray-700 p-2 rounded" disabled={exercise.status !== 'pending'} min="0" />
                                    <input type="number" value={exercise.actualDistance || ''} onChange={e => onUpdate({ actualDistance: e.target.value })} placeholder="Distance (km)" className="bg-gray-700 p-2 rounded" disabled={exercise.status !== 'pending'} min="0" />
                                </div>
                            )}
                            <input type="text" value={note || ''} onChange={e => setNote(e.target.value)} onBlur={handleNoteBlur} placeholder={isSkipping ? "Reason for skipping is required" : "Notes"} className={`w-full bg-gray-700 p-2 rounded ${isSkipping ? 'border-2 border-red-500' : ''}`} disabled={exercise.status !== 'pending' && !isSkipping} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [weeklyPlan, setWeeklyPlan] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date("2025-07-15")); // Start on tomorrow's date
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [editingExercise, setEditingExercise] = useState(null);
    const [user, setUser] = useState({ name: 'Matei', height: 170, weight: 100, age: 30, profilePic: null });
    const [toast, setToast] = useState({ show: false, message: '' });
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);

    useEffect(() => {
        const plan = {};
        Object.entries(initialPastData).forEach(([date, exercises]) => {
            plan[date] = exercises.map(parseExerciseString);
        });
        setWeeklyPlan(plan);
    }, []);

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 2000);
    };

    const findPreviousWeight = (exerciseName, forDate) => {
        let searchDate = new Date(forDate);
        for (let i = 0; i < 30; i++) {
            searchDate.setDate(searchDate.getDate() - 1);
            const dateKey = toYYYYMMDD(searchDate);
            if (weeklyPlan[dateKey]) {
                const found = weeklyPlan[dateKey].find(ex => ex.name === exerciseName);
                if (found) return found.targetWeightValue;
            }
        }
        return null;
    };

    const updateExercise = (id, updatedFields) => {
        const dateKey = toYYYYMMDD(currentDate);
        const newExercises = weeklyPlan[dateKey].map(ex => ex.id === id ? { ...ex, ...updatedFields } : ex);
        setWeeklyPlan({ ...weeklyPlan, [dateKey]: newExercises });
    };
    
    const handleEditExercise = (exercise) => {
        setEditingExercise(exercise);
        setActiveModal('edit');
    };

    const handleSaveEditedExercise = (editedExercise) => {
        updateExercise(editedExercise.id, editedExercise);
        showToast("Exercise updated!");
    };

    const handleDeleteExercise = (id) => {
        const dateKey = toYYYYMMDD(currentDate);
        const newExercises = weeklyPlan[dateKey].filter(ex => ex.id !== id);
        setWeeklyPlan({ ...weeklyPlan, [dateKey]: newExercises });
        showToast("Exercise deleted");
    };
    
    const handleAddExercise = (newExerciseData) => {
        const dateKey = toYYYYMMDD(currentDate);
        const newExercise = {
            ...parseExerciseString(`${newExerciseData.name}: ${newExerciseData.targetSets}x${newExerciseData.targetReps} @ ${newExerciseData.targetWeight}`),
            type: newExerciseData.type,
            visualAid: newExerciseData.visualAid || exerciseVisuals[newExerciseData.name] || null
        };
        const currentExercises = weeklyPlan[dateKey] || [];
        setWeeklyPlan({ ...weeklyPlan, [dateKey]: [...currentExercises, newExercise] });
        showToast("Exercise added!");
    };

    const generateSummary = () => {
        const exercisesForDay = weeklyPlan[toYYYYMMDD(currentDate)] || [];
        let summary = `Workout Summary for ${formatDate(currentDate)}:\n\n`;
        exercisesForDay.forEach(ex => {
            if (ex.status === 'pending') return;
            summary += `• ${ex.name}: `;
            if (ex.status === 'completed') summary += `Completed.`;
            if (ex.status === 'beat-target') summary += `Completed (Beat Target!).`;
            if (ex.status === 'skipped') { summary += `Skipped. Notes: ${ex.note || 'No reason given.'}\n`; return; }
            if (ex.type === 'strength') {
                const sets = ex.targetSets;
                const reps = ex.actualReps || ex.targetReps;
                const weight = ex.actualWeight ? `${ex.actualWeight}kg` : ex.targetWeight;
                summary += ` Sets: ${sets}, Reps: ${reps}, Weight: ${weight}.`;
            } else {
                if (ex.actualTime) summary += ` Time: ${ex.actualTime} min.`;
                if (ex.actualDistance) summary += ` Distance: ${ex.actualDistance} km.`;
            }
            if (ex.note) summary += ` Notes: ${ex.note}.`;
            summary += '\n';
        });
        return summary;
    };

    const handleCopySummary = () => {
        const summaryText = generateSummary();
        navigator.clipboard.writeText(summaryText);
        showToast("Summary copied to clipboard!");
        setActiveModal(null);
    };


    const completeExercise = (id) => {
        const dateKey = toYYYYMMDD(currentDate);
        const exercise = weeklyPlan[dateKey].find(ex => ex.id === id);
        if (!exercise) return;

        let newStatus = 'completed';
        if (exercise.type === 'strength' && parseFloat(exercise.actualWeight) > exercise.targetWeightValue) {
            newStatus = 'beat-target';
        }
        updateExercise(id, { status: newStatus, completedTimestamp: Date.now() });
        showToast("Great Job!");
    };
    
    const skipExercise = (id, note) => {
        updateExercise(id, { status: 'skipped', note, completedTimestamp: Date.now() });
        showToast("Exercise skipped");
    };

    const undoExercise = (id) => {
        const dateKey = toYYYYMMDD(currentDate);
        const exerciseToUndo = weeklyPlan[dateKey].find(ex => ex.id === id);
        if (!exerciseToUndo) return;

        updateExercise(id, {
            status: 'pending',
            completedTimestamp: null,
            actualReps: '',
            actualWeight: '',
            actualTime: '',
            actualDistance: '',
            note: exerciseToUndo.status === 'skipped' ? exerciseToUndo.note : ''
        });
        showToast("Action undone");
    };

    const exercisesForDay = useMemo(() => {
        const dateKey = toYYYYMMDD(currentDate);
        const exercises = weeklyPlan[dateKey] || [];
        return [...exercises].sort((a, b) => {
            const aDone = a.status !== 'pending', bDone = b.status !== 'pending';
            if (aDone !== bDone) return aDone - bDone;
            return (a.completedTimestamp || 0) - (b.completedTimestamp || 0);
        });
    }, [currentDate, weeklyPlan]);

    const isWorkoutComplete = useMemo(() => {
        if (exercisesForDay.length === 0) return false;
        return exercisesForDay.every(ex => ex.status !== 'pending');
    }, [exercisesForDay]);

    // --- DRAG & DROP HANDLERS ---
    const handleDragStart = (e, item) => {
        setDraggedItem(item);
    };

    const handleDragOver = (e, item) => {
        e.preventDefault();
        if (item.id !== draggedItem?.id) {
            setDropTarget(item.id);
        }
    };
    
    const handleDrop = (e, dropItem) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === dropItem.id) return;

        const dateKey = toYYYYMMDD(currentDate);
        let currentItems = [...weeklyPlan[dateKey]];
        const draggedIndex = currentItems.findIndex(item => item.id === draggedItem.id);
        const dropIndex = currentItems.findIndex(item => item.id === dropItem.id);
        
        const [reorderedItem] = currentItems.splice(draggedIndex, 1);
        currentItems.splice(dropIndex, 0, reorderedItem);

        setWeeklyPlan({...weeklyPlan, [dateKey]: currentItems});
        setDraggedItem(null);
        setDropTarget(null);
    };
    
    const handleDragEnd = () => {
        setDraggedItem(null);
        setDropTarget(null);
    };

    return (
        <>
            <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
                <div className={`fixed top-0 left-0 h-full bg-gray-800 w-64 z-40 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}><div className="p-4"><div className="flex items-center space-x-3 mb-6"><img src={user.profilePic || `https://placehold.co/100x100/1f2937/7dd3fc?text=${user.name.charAt(0)}`} alt="Profile" className="w-12 h-12 rounded-full object-cover" /><div><p className="font-bold text-lg">{user.name}</p><button onClick={() => { setActiveModal('profile'); setIsMenuOpen(false); }} className="text-xs text-cyan-400">Edit Profile</button></div></div><ul><li onClick={() => { setActiveModal('trends'); setIsMenuOpen(false); }} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer"><TrendingUp size={20} /><span>Trends</span></li></ul></div></div>
                {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/50 z-30"></div>}

                <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pb-32">
                    <header className="flex items-center justify-between mb-6"><button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md hover:bg-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button><h1 className="text-xl font-bold text-white tracking-tight">Workout Companion</h1><div className="w-10"></div></header>
                    
                    <div className="flex items-center justify-between bg-gray-800 p-2 rounded-lg mb-8">
                        <button onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() - 1)))} className="p-2 rounded-md hover:bg-gray-700"><ChevronLeft/></button>
                        <div className="text-center"><div className="text-lg font-bold text-white">{formatDate(currentDate)}</div>{toYYYYMMDD(new Date()) !== toYYYYMMDD(currentDate) && <button onClick={() => setCurrentDate(new Date())} className="text-xs text-cyan-400 hover:text-cyan-300">Go to Today</button>}</div>
                        <button onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() + 1)))} className="p-2 rounded-md hover:bg-gray-700"><ChevronRight/></button>
                    </div>

                    <div className="space-y-4">
                        {isWorkoutComplete && (
                            <div className="bg-green-800/50 border border-green-600 text-white p-4 rounded-lg text-center flex items-center justify-center space-x-3">
                                <PartyPopper className="text-green-300" />
                                <div>
                                    <h3 className="font-bold text-lg">Workout Complete!</h3>
                                    <p className="text-sm text-green-200">Great job finishing all your exercises for today.</p>
                                </div>
                            </div>
                        )}
                        {exercisesForDay.length > 0 ? exercisesForDay.map(ex => {
                            let trendIndicator = null;
                            if (ex.type === 'strength') {
                                const prevWeight = findPreviousWeight(ex.name, currentDate);
                                if (prevWeight !== null && ex.targetWeightValue > prevWeight) {
                                    const percentIncrease = ((ex.targetWeightValue - prevWeight) / prevWeight) * 100;
                                    trendIndicator = (<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-900 text-green-300"><TrendingUp className="w-3 h-3 mr-1" />+{percentIncrease.toFixed(1)}%</span>);
                                }
                            }
                            return (
                                <div key={ex.id} className={dropTarget === ex.id ? 'drop-indicator' : ''}>
                                    <ExerciseItem 
                                        exercise={ex} 
                                        onUpdate={(fields) => updateExercise(ex.id, fields)} 
                                        onComplete={() => completeExercise(ex.id)} 
                                        onSkip={(note) => skipExercise(ex.id, note)}
                                        onUndo={() => undoExercise(ex.id)}
                                        onEdit={() => handleEditExercise(ex)}
                                        onShowVisualAid={() => setActiveModal(`visual-${ex.id}`)} 
                                        trend={trendIndicator}
                                        onDragStart={(e) => handleDragStart(e, ex)}
                                        onDragOver={(e) => handleDragOver(e, ex)}
                                        onDrop={(e) => handleDrop(e, ex)}
                                        onDragEnd={handleDragEnd}
                                        isDragging={draggedItem?.id === ex.id}
                                    />
                                </div>
                            )
                        }) : (
                             <div className="text-center py-16 bg-gray-800 rounded-lg flex flex-col items-center justify-center space-y-4">
                                <ClipboardPlus size={48} className="text-gray-500" />
                                <h3 className="text-xl font-semibold text-white">No Workout Planned</h3>
                                <p className="text-gray-400 mt-2 max-w-xs">It's a rest day! Or, you can add a new workout to get started.</p>
                                <button 
                                    onClick={() => setActiveModal('add')} 
                                    className="mt-4 flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg"
                                >
                                    <Plus size={20} className="mr-2" />
                                    Add a Workout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                 <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
                    <div className="max-w-2xl mx-auto p-4 flex gap-4">
                        <button onClick={() => setActiveModal('add')} className="w-1/2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg text-base transition-all duration-200 flex items-center justify-center"><Plus size={20} className="mr-2" />Add Exercise</button>
                        <button onClick={() => setActiveModal('summary')} className="w-1/2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg text-base transition-all duration-200 flex items-center justify-center"><ClipboardList size={20} className="mr-2" />Review Summary</button>
                    </div>
                </div>

                {/* Modals */}
                {activeModal === 'profile' && <ProfileModal user={user} setUser={setUser} onClose={() => setActiveModal(null)} />}
                {activeModal === 'trends' && <TrendsModal weeklyPlan={weeklyPlan} onClose={() => setActiveModal(null)} />}
                {activeModal === 'edit' && <EditExerciseModal exercise={editingExercise} onSave={handleSaveEditedExercise} onDelete={handleDeleteExercise} onClose={() => setActiveModal(null)} />}
                {activeModal === 'add' && <AddExerciseModal onAdd={handleAddExercise} onClose={() => setActiveModal(null)} />}
                {activeModal === 'summary' && <SummaryModal summary={generateSummary()} onClose={() => setActiveModal(null)} onCopy={handleCopySummary} />}
                {activeModal && activeModal.startsWith('visual-') && (() => {
                    const exId = activeModal.split('-')[1];
                    const exercise = [...Object.values(weeklyPlan)].flat().find(e => e.id == exId);
                    if (!exercise) return null;
                    return <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"><div className="p-6"><h2 className="text-2xl font-bold text-white mb-4 text-center">{exercise.name}</h2><div className="aspect-square w-full bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden"><img src={exercise.visualAid} className="w-full h-full object-contain" alt={exercise.name}/></div><button onClick={() => setActiveModal(null)} className="mt-4 w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg">Close</button></div></div></div>
                })()}
                {toast.show && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-5 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 opacity-100 translate-y-0">{toast.message}</div>}
            </div>
        </>
    );
}
