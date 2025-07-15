import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, User, TrendingUp, X, Camera, Info, Undo2, GripVertical, Pencil, Trash2, Plus, ClipboardList, PartyPopper, ClipboardPlus, LogIn, LogOut, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, enableIndexedDbPersistence } from 'firebase/firestore';

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyC1jlts2xQZevR7W71G_6cZvWhzT2MlUqs",
  authDomain: "workout-companion-app.firebaseapp.com",
  projectId: "workout-companion-app",
  storageBucket: "workout-companion-app.appspot.com",
  messagingSenderId: "187661338158",
  appId: "1:187661338158:web:6cb196160755aa249c41bf",
  measurementId: "G-J84C5N9SXH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

enableIndexedDbPersistence(db).catch((err) => { if (err.code == 'failed-precondition') { console.warn("Firestore persistence failed: Multiple tabs open."); } else if (err.code == 'unimplemented') { console.warn("Firestore persistence failed: Browser does not support it."); } });

// --- HELPER FUNCTIONS ---
const toYYYYMMDD = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const formatDate = (date) => date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const parseExerciseString = (line) => {
    const name = line.split(':')[0].trim();
    const base = { id: Math.random(), name, type: 'strength', targetSets: 'N/A', targetReps: 'N/A', targetWeight: 'N/A', targetWeightValue: 0, actualReps: '', actualWeight: '', actualTime: '', actualDistance: '', note: '', status: 'pending', completedTimestamp: null };
    if (name.toLowerCase().includes('skipping') || name.toLowerCase().includes('treadmill') || name.toLowerCase().includes('basketball') || name.toLowerCase().includes('run')) base.type = 'cardio';
    if (line.includes('stopped due to')) { base.note = 'Stopped due to' + line.split(' stopped due to')[1]; return base; }
    const parts = line.split(':');
    if (parts.length < 2) return base;
    const details = parts[1].trim();
    const atSplit = details.split('@');
    if (atSplit.length > 1) { base.targetWeight = atSplit[1].trim(); base.targetWeightValue = parseFloat(base.targetWeight) || 0; }
    const setsRepsPart = atSplit[0].trim();
    const xSplit = setsRepsPart.split('x');
    if (xSplit.length > 1) { base.targetSets = xSplit[0].trim(); base.targetReps = xSplit[1].trim(); }
    return base;
};

// --- MODAL & UI COMPONENTS ---
const LoginScreen = ({ onLogin }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8" style={{background: 'radial-gradient(circle, rgba(31,41,55,1) 0%, rgba(17,24,39,1) 100%)'}}>
        <div className="text-center mb-12"><h1 className="text-5xl font-bold mb-3 tracking-tight">Workout Companion</h1><p className="text-lg text-gray-400">Track your progress. See the results.</p></div>
        <button onClick={onLogin} className="flex items-center justify-center bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
            <svg className="w-6 h-6 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.586,44,31.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
            Sign In with Google
        </button>
    </div>
);

const ProfileModal = ({ user, onSave, onClose }) => {
    const [profileData, setProfileData] = useState(user);
    const handleSave = () => { onSave(profileData); onClose(); };
    const handlePicChange = (e) => { if (e.target.files && e.target.files[0]) setProfileData({...profileData, profilePic: URL.createObjectURL(e.target.files[0])}); };
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md"><h2 className="text-2xl font-bold mb-4">Profile</h2><div className="flex items-center space-x-4 mb-6"><div className="relative"><img src={profileData.profilePic || `https://placehold.co/100x100/1f2937/7dd3fc?text=${(profileData.name || ' ').charAt(0)}`} alt="Profile" className="w-24 h-24 rounded-full object-cover" /><label htmlFor="profile-pic-upload" className="absolute bottom-0 right-0 bg-cyan-500 p-1.5 rounded-full cursor-pointer hover:bg-cyan-600"><Camera size={16} /></label><input id="profile-pic-upload" type="file" className="hidden" accept="image/*" onChange={handlePicChange} /></div><input type="text" value={profileData.name || ''} onChange={e => setProfileData({...profileData, name: e.target.value})} placeholder="Your Name" className="bg-gray-700 border-gray-600 rounded p-2 text-xl font-bold w-full" /></div><div className="grid grid-cols-3 gap-4 mb-6"><div><label className="text-xs text-gray-400">Height (cm)</label><input type="number" value={profileData.height || ''} onChange={e => setProfileData({...profileData, height: e.target.value})} placeholder="cm" className="bg-gray-700 border-gray-600 rounded p-2 w-full mt-1" /></div><div><label className="text-xs text-gray-400">Weight (kg)</label><input type="number" value={profileData.weight || ''} onChange={e => setProfileData({...profileData, weight: e.target.value})} placeholder="kg" className="bg-gray-700 border-gray-600 rounded p-2 w-full mt-1" /></div><div><label className="text-xs text-gray-400">Age</label><input type="number" value={profileData.age || ''} onChange={e => setProfileData({...profileData, age: e.target.value})} placeholder="Age" className="bg-gray-700 border-gray-600 rounded p-2 w-full mt-1" /></div></div><div className="flex justify-end space-x-2"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button><button onClick={handleSave} className="bg-cyan-600 px-4 py-2 rounded">Save</button></div></div></div>
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
    const handleFieldChange = (field, value) => setEditedExercise(prev => ({ ...prev, [field]: value }));
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
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md"><h2 className="text-2xl font-bold mb-4">Edit Exercise</h2><div className="space-y-4"><div><label className="text-xs text-gray-400">Exercise Name</label><input type="text" value={editedExercise.name || ''} onChange={e => handleFieldChange('name', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div><div><label className="text-xs text-gray-400">Target Sets</label><input type="text" value={editedExercise.targetSets || ''} onChange={e => handleFieldChange('targetSets', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div><div><label className="text-xs text-gray-400">Target Reps</label><input type="text" value={editedExercise.targetReps || ''} onChange={e => handleFieldChange('targetReps', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div><div><label className="text-xs text-gray-400">Target Weight</label><input type="text" value={editedExercise.targetWeight || ''} onChange={e => handleFieldChange('targetWeight', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" placeholder="e.g., 40kg" /></div></div><div className="flex justify-between items-center mt-6"><button onClick={handleDeleteClick} className={`px-4 py-2 rounded flex items-center transition-colors ${confirmDelete ? 'bg-red-600' : 'bg-red-900/50 hover:bg-red-900'}`}><Trash2 size={16} className="mr-2" /> {confirmDelete ? 'Confirm Delete?' : 'Delete'}</button><div className="space-x-2"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button><button onClick={handleSave} className="bg-cyan-600 px-4 py-2 rounded">Save Changes</button></div></div></div></div>
    );
};

const AddExerciseModal = ({ onAdd, onClose }) => {
    const [newExercise, setNewExercise] = useState({ name: '', type: 'strength', targetSets: '', targetReps: '', targetWeight: '' });
    const handleFieldChange = (field, value) => setNewExercise(prev => ({ ...prev, [field]: value }));
    const handleAdd = () => { onAdd(newExercise); onClose(); };
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md"><h2 className="text-2xl font-bold mb-4">Add New Exercise</h2><div className="space-y-4"><div><label className="text-xs text-gray-400">Exercise Name</label><input type="text" value={newExercise.name} onChange={e => handleFieldChange('name', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div><div><label className="text-xs text-gray-400">Exercise Type</label><select value={newExercise.type} onChange={e => handleFieldChange('type', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1"><option value="strength">Strength</option><option value="cardio">Cardio</option></select></div>{newExercise.type === 'strength' && (<><div><label className="text-xs text-gray-400">Target Sets</label><input type="text" value={newExercise.targetSets} onChange={e => handleFieldChange('targetSets', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div><div><label className="text-xs text-gray-400">Target Reps</label><input type="text" value={newExercise.targetReps} onChange={e => handleFieldChange('targetReps', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div><div><label className="text-xs text-gray-400">Target Weight</label><input type="text" value={newExercise.targetWeight} onChange={e => handleFieldChange('targetWeight', e.target.value)} className="bg-gray-700 p-2 rounded w-full mt-1" /></div></>)}</div><div className="flex justify-end space-x-2 mt-6"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button><button onClick={handleAdd} className="bg-cyan-600 px-4 py-2 rounded">Add Exercise</button></div></div></div>
    );
};

const SummaryModal = ({ summary, onClose, onCopy }) => (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-lg"><h2 className="text-2xl font-bold mb-4">Workout Summary</h2><textarea readOnly value={summary} className="w-full h-64 bg-gray-900 text-gray-200 rounded-lg p-3 border border-gray-600"></textarea><div className="flex justify-end space-x-2 mt-4"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Close</button><button onClick={onCopy} className="bg-green-600 px-4 py-2 rounded">Copy to Clipboard</button></div></div></div>
);

const ImportModal = ({ existingPlan, onImport, onClose }) => {
    const [rawText, setRawText] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [resolutions, setResolutions] = useState({});

    const exampleText = `July 18 2025\n• Dumbbell Bench Press: 3x12 @ 15kg/hand\n• Seated Cable Row: 3x12 @ 45kg\n\nJuly 20 2025\n• Leg Curls: 3x12 @ 50kg`;

    const sanitizeText = (text) => {
        let sanitized = text.replace(/[\*•-]/g, '\n• ');
        return sanitized.replace(/\n\s*\n/g, '\n');
    };

    const handlePreview = async () => {
        setIsLoading(true);
        setError('');
        setParsedData(null);
        const sanitizedText = sanitizeText(rawText);
        const prompt = `Parse the following workout text into a structured JSON object. The top-level keys must be dates in "YYYY-MM-DD" format. Each date key should have a value of an array of strings, where each string is a single exercise. Infer the year if it's missing. Today is ${new Date().toDateString()}. Here is the text: \n\n${sanitizedText}`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", patternProperties: { "^\\d{4}-\\d{2}-\\d{2}$": { type: "ARRAY", items: { type: "STRING" } } } } } };
        const apiKey = firebaseConfig.apiKey; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API error: ${response.statusText}`);
            const result = await response.json();
            const parsedJsonText = result.candidates[0].content.parts[0].text;
            const parsed = JSON.parse(parsedJsonText);
            const initialResolutions = {};
            Object.keys(parsed).forEach(dateKey => { if (existingPlan[dateKey]) { initialResolutions[dateKey] = 'skip'; } });
            setResolutions(initialResolutions);
            setParsedData(parsed);
        } catch (e) { console.error(e); setError("Failed to parse the workout plan. Please check the format and try again."); } finally { setIsLoading(false); }
    };

    const handleResolutionChange = (dateKey, resolution) => setResolutions(prev => ({ ...prev, [dateKey]: resolution }));
    const handleConfirmImport = () => { onImport(parsedData, resolutions); onClose(); };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-2xl"><h2 className="text-2xl font-bold mb-4">Import from Text</h2>{!parsedData ? (<><p className="text-gray-400 mb-4">Paste your workout plan below. Use clear dates and list exercises for each day.</p><textarea value={rawText} onChange={e => setRawText(e.target.value)} placeholder={exampleText} className="w-full h-64 bg-gray-900 text-gray-200 rounded-lg p-3 border border-gray-600 focus:border-cyan-500"></textarea>{error && <p className="text-red-400 mt-2">{error}</p>}<div className="flex justify-end space-x-2 mt-4"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button><button onClick={handlePreview} disabled={isLoading || !rawText} className="bg-cyan-600 px-4 py-2 rounded disabled:opacity-50 flex items-center">{isLoading ? <><Loader2 className="animate-spin mr-2" /> Processing...</> : 'Preview Import'}</button></div></>) : (<><h3 className="text-lg font-semibold mb-2">Import Preview</h3><p className="text-gray-400 mb-4">Review the parsed workouts and resolve any conflicts.</p><div className="max-h-80 overflow-y-auto space-y-4 pr-2">{Object.entries(parsedData).map(([dateKey, exercises]) => (<div key={dateKey} className={`p-3 rounded-lg ${existingPlan[dateKey] ? 'bg-yellow-900/50 border border-yellow-700' : 'bg-gray-900'}`}><h4 className="font-bold">{formatDate(new Date(dateKey + 'T00:00:00'))}</h4>{existingPlan[dateKey] && (<div className="flex items-center space-x-4 my-2 text-sm"><span className="text-yellow-400 flex items-center"><AlertTriangle size={16} className="mr-2"/> Conflict: Data already exists for this day.</span><div><label className="mr-2"><input type="radio" name={`resolve-${dateKey}`} value="skip" checked={resolutions[dateKey] === 'skip'} onChange={() => handleResolutionChange(dateKey, 'skip')} /> Skip</label><label><input type="radio" name={`resolve-${dateKey}`} value="override" checked={resolutions[dateKey] === 'override'} onChange={() => handleResolutionChange(dateKey, 'override')} /> Override</label></div></div>)}<ul className="list-disc list-inside text-gray-300 text-sm pl-2">{exercises.map((ex, i) => <li key={i}>{ex}</li>)}</ul></div>))}</div><div className="flex justify-end space-x-2 mt-6"><button onClick={() => setParsedData(null)} className="bg-gray-600 px-4 py-2 rounded">Back</button><button onClick={handleConfirmImport} className="bg-green-600 px-4 py-2 rounded">Confirm & Import</button></div></>)}</div></div>
    );
};

const VisualAidModal = ({ exercise, onClose, onDescriptionFetched, cachedDescription }) => {
    const [description, setDescription] = useState(cachedDescription || '');
    const [isLoading, setIsLoading] = useState(!cachedDescription);
    const [error, setError] = useState('');

    useEffect(() => {
        if (cachedDescription) return;
        const fetchDescription = async () => {
            const prompt = `Provide a concise, 2-3 line explanation for how to perform a ${exercise.name}. Focus on the key steps.`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = firebaseConfig.apiKey;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) throw new Error('API request failed');
                const result = await response.json();
                const text = result.candidates[0].content.parts[0].text;
                setDescription(text);
                onDescriptionFetched(exercise.name, text);
            } catch (e) {
                setError('Could not fetch exercise description.');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDescription();
    }, [exercise.name, cachedDescription, onDescriptionFetched]);

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"><div className="p-6"><h2 className="text-2xl font-bold text-white mb-4 text-center">{exercise.name}</h2><div className="min-h-[10rem] bg-gray-900 rounded-lg p-4 text-gray-300">{isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div> : error || description}</div><button onClick={onClose} className="mt-4 w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg">Close</button></div></div></div>
    );
};

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
        <div draggable={exercise.status === 'pending'} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd} className={`bg-gray-800 rounded-lg shadow-md exercise-item transition-all duration-300 status-${exercise.status} ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
            <div className="p-4"><div className="flex items-start space-x-2">{exercise.status === 'pending' && <GripVertical className="text-gray-600 mt-2 cursor-grab" />}<input type="checkbox" checked={exercise.status !== 'pending'} onChange={onComplete} className="form-checkbox h-7 w-7 mt-1 bg-gray-700 border-gray-600 rounded text-cyan-500 focus:ring-cyan-500/50 cursor-pointer" disabled={exercise.status !== 'pending'} /><div className="flex-1 min-w-0"><div className="flex justify-between items-center"><div className="flex items-center flex-wrap"><h3 className="text-lg font-semibold text-white">{exercise.name}</h3>{trend}</div><div className="flex items-center space-x-1"><button onClick={onShowVisualAid} className="p-1 text-gray-500 hover:text-cyan-400"><Info size={20} /></button>{exercise.status === 'pending' && <button onClick={onEdit} className="p-1 text-gray-500 hover:text-cyan-400"><Pencil size={18} /></button>}{exercise.status === 'pending' && <button onClick={() => setIsSkipping(true)} className="p-1 text-gray-500 hover:text-red-400"><X size={20} /></button>}{exercise.status !== 'pending' && <button onClick={onUndo} className="p-1 text-gray-500 hover:text-cyan-400" title="Undo"><Undo2 size={20} /></button>}</div></div><p className="text-sm text-gray-400">Target: {exercise.targetSets} of {exercise.targetReps} @ {exercise.targetWeight}</p><div className={`mt-4 space-y-3 ${exercise.status !== 'pending' ? 'opacity-50' : ''}`}>{exercise.type === 'strength' ? (<div className="grid grid-cols-2 gap-3"><input type="text" value={exercise.actualReps || ''} onChange={e => onUpdate({ actualReps: e.target.value })} placeholder={exercise.targetReps || 'e.g., 3x12'} className="bg-gray-700 p-2 rounded" disabled={exercise.status !== 'pending'} /><input type="number" value={exercise.actualWeight || ''} onChange={e => onUpdate({ actualWeight: e.target.value })} placeholder={String(exercise.targetWeightValue)} className="bg-gray-700 p-2 rounded" disabled={exercise.status !== 'pending'} min="0" step="0.5" /></div>) : (<div className="grid grid-cols-2 gap-3"><input type="number" value={exercise.actualTime || ''} onChange={e => onUpdate({ actualTime: e.target.value })} placeholder="Time (min)" className="bg-gray-700 p-2 rounded" disabled={exercise.status !== 'pending'} min="0" /><input type="number" value={exercise.actualDistance || ''} onChange={e => onUpdate({ actualDistance: e.target.value })} placeholder="Distance (km)" className="bg-gray-700 p-2 rounded" disabled={exercise.status !== 'pending'} min="0" /></div>)}<input type="text" value={note || ''} onChange={e => setNote(e.target.value)} onBlur={handleNoteBlur} placeholder={isSkipping ? "Reason for skipping is required" : "Notes"} className={`w-full bg-gray-700 p-2 rounded ${isSkipping ? 'border-2 border-red-500' : ''}`} disabled={exercise.status !== 'pending' && !isSkipping} /></div></div></div></div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [weeklyPlan, setWeeklyPlan] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [editingExercise, setEditingExercise] = useState(null);
    const [userProfile, setUserProfile] = useState({ name: '', height: '', weight: '', age: '', profilePic: null });
    const [toast, setToast] = useState({ show: false, message: '' });
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exerciseDescriptions, setExerciseDescriptions] = useState({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    setUserProfile(data.profile || { name: user.displayName, email: user.email, profilePic: user.photoURL });
                    setWeeklyPlan(data.workouts || {});
                    setExerciseDescriptions(data.descriptions || {});
                } else {
                    const profile = { name: user.displayName, email: user.email, profilePic: user.photoURL };
                    await setDoc(userDocRef, { profile, workouts: {}, descriptions: {} });
                    setUserProfile(profile);
                    setWeeklyPlan({});
                    setExerciseDescriptions({});
                }
            } else {
                setCurrentUser(null);
                setWeeklyPlan({});
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const showToast = (message) => { setToast({ show: true, message }); setTimeout(() => setToast({ show: false, message: '' }), 2000); };
    const handleLogin = async () => { try { await signInWithPopup(auth, provider); } catch (error) { console.error("Authentication error:", error); } };
    const handleLogout = async () => { await signOut(auth); };
    const updateFirestore = async (data) => { if (!currentUser) return; const userDocRef = doc(db, 'users', currentUser.uid); await setDoc(userDocRef, data, { merge: true }); };
    const updateExercise = (id, updatedFields) => {
        const dateKey = toYYYYMMDD(currentDate);
        const newExercises = weeklyPlan[dateKey].map(ex => ex.id === id ? { ...ex, ...updatedFields } : ex);
        const newWeeklyPlan = { ...weeklyPlan, [dateKey]: newExercises };
        setWeeklyPlan(newWeeklyPlan);
        updateFirestore({ workouts: newWeeklyPlan });
    };
    const handleSaveProfile = (newProfile) => { setUserProfile(newProfile); updateFirestore({ profile: newProfile }); };
    const findPreviousWeight = (exerciseName, forDate) => { let searchDate = new Date(forDate); for (let i = 0; i < 30; i++) { searchDate.setDate(searchDate.getDate() - 1); const dateKey = toYYYYMMDD(searchDate); if (weeklyPlan[dateKey]) { const found = weeklyPlan[dateKey].find(ex => ex.name === exerciseName); if (found) return found.targetWeightValue; } } return null; };
    const handleEditExercise = (exercise) => { setEditingExercise(exercise); setActiveModal('edit'); };
    const handleSaveEditedExercise = (editedExercise) => { updateExercise(editedExercise.id, editedExercise); showToast("Exercise updated!"); };
    const handleDeleteExercise = (id) => {
        const dateKey = toYYYYMMDD(currentDate);
        const newExercises = weeklyPlan[dateKey].filter(ex => ex.id !== id);
        const newWeeklyPlan = { ...weeklyPlan, [dateKey]: newExercises };
        setWeeklyPlan(newWeeklyPlan);
        updateFirestore({ workouts: newWeeklyPlan });
        showToast("Exercise deleted");
    };
    const handleAddExercise = (newExerciseData) => {
        const dateKey = toYYYYMMDD(currentDate);
        const newExercise = { ...parseExerciseString(`${newExerciseData.name}: ${newExerciseData.targetSets}x${newExerciseData.targetReps} @ ${newExerciseData.targetWeight}`), type: newExerciseData.type };
        const currentExercises = weeklyPlan[dateKey] || [];
        const newWeeklyPlan = { ...weeklyPlan, [dateKey]: [...currentExercises, newExercise] };
        setWeeklyPlan(newWeeklyPlan);
        updateFirestore({ workouts: newWeeklyPlan });
        showToast("Exercise added!");
    };
    const handleImportConfirm = (parsedData, resolutions) => {
        const newPlan = { ...weeklyPlan };
        Object.entries(parsedData).forEach(([dateKey, exercises]) => {
            if (resolutions[dateKey] !== 'skip') {
                newPlan[dateKey] = exercises.map(parseExerciseString);
            }
        });
        setWeeklyPlan(newPlan);
        updateFirestore({ workouts: newPlan });
        showToast("Plan imported successfully!");
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
            if (ex.type === 'strength') { const sets = ex.targetSets; const reps = ex.actualReps || ex.targetReps; const weight = ex.actualWeight ? `${ex.actualWeight}kg` : ex.targetWeight; summary += ` Sets: ${sets}, Reps: ${reps}, Weight: ${weight}.`; }
            else { if (ex.actualTime) summary += ` Time: ${ex.actualTime} min.`; if (ex.actualDistance) summary += ` Distance: ${ex.actualDistance} km.`; }
            if (ex.note) summary += ` Notes: ${ex.note}.`;
            summary += '\n';
        });
        return summary;
    };
    const handleCopySummary = () => { const summaryText = generateSummary(); navigator.clipboard.writeText(summaryText); showToast("Summary copied to clipboard!"); setActiveModal(null); };
    const completeExercise = (id) => { const dateKey = toYYYYMMDD(currentDate); const exercise = weeklyPlan[dateKey].find(ex => ex.id === id); if (!exercise) return; let newStatus = 'completed'; if (exercise.type === 'strength' && parseFloat(exercise.actualWeight) > exercise.targetWeightValue) newStatus = 'beat-target'; updateExercise(id, { status: newStatus, completedTimestamp: Date.now() }); showToast("Great Job!"); };
    const skipExercise = (id, note) => { updateExercise(id, { status: 'skipped', note, completedTimestamp: Date.now() }); showToast("Exercise skipped"); };
    const undoExercise = (id) => { const dateKey = toYYYYMMDD(currentDate); const exerciseToUndo = weeklyPlan[dateKey].find(ex => ex.id === id); if (!exerciseToUndo) return; updateExercise(id, { status: 'pending', completedTimestamp: null, actualReps: '', actualWeight: '', actualTime: '', actualDistance: '', note: exerciseToUndo.status === 'skipped' ? exerciseToUndo.note : '' }); showToast("Action undone"); };
    const exercisesForDay = useMemo(() => { const dateKey = toYYYYMMDD(currentDate); const exercises = weeklyPlan[dateKey] || []; return [...exercises].sort((a, b) => { const aDone = a.status !== 'pending', bDone = b.status !== 'pending'; if (aDone !== bDone) return aDone - bDone; return (a.completedTimestamp || 0) - (b.completedTimestamp || 0); }); }, [currentDate, weeklyPlan]);
    const isWorkoutComplete = useMemo(() => { if (exercisesForDay.length === 0) return false; return exercisesForDay.every(ex => ex.status !== 'pending'); }, [exercisesForDay]);
    const handleDragStart = (e, item) => setDraggedItem(item);
    const handleDragOver = (e, item) => { e.preventDefault(); if (item.id !== draggedItem?.id) setDropTarget(item.id); };
    const handleDrop = (e, dropItem) => { e.preventDefault(); if (!draggedItem || draggedItem.id === dropItem.id) return; const dateKey = toYYYYMMDD(currentDate); let currentItems = [...weeklyPlan[dateKey]]; const draggedIndex = currentItems.findIndex(item => item.id === draggedItem.id); const dropIndex = currentItems.findIndex(item => item.id === dropItem.id); const [reorderedItem] = currentItems.splice(draggedIndex, 1); currentItems.splice(dropIndex, 0, reorderedItem); const newWeeklyPlan = { ...weeklyPlan, [dateKey]: currentItems }; setWeeklyPlan(newWeeklyPlan); updateFirestore({ workouts: newWeeklyPlan }); setDraggedItem(null); setDropTarget(null); };
    const handleDragEnd = () => { setDraggedItem(null); setDropTarget(null); };
    const handleDescriptionFetched = (name, description) => {
        const newDescriptions = { ...exerciseDescriptions, [name]: description };
        setExerciseDescriptions(newDescriptions);
        updateFirestore({ descriptions: newDescriptions });
    };

    if (loading) return <div className="bg-gray-900 h-screen flex items-center justify-center text-white">Loading...</div>;
    if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

    return (
        <>
            <style>{`.exercise-item { border-left: 6px solid transparent; } .status-completed { border-left-color: #22c55e; } .status-beat-target { border-left-color: #f97316; } .status-skipped { border-left-color: #ef4444; } .drop-indicator { border-top: 2px solid #22d3ee; }`}</style>
            <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
                <div className={`fixed top-0 left-0 h-full bg-gray-800 w-64 z-40 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}><div className="p-4"><div className="flex items-center space-x-3 mb-6"><img src={userProfile.profilePic || `https://placehold.co/100x100/1f2937/7dd3fc?text=${(userProfile.name || ' ').charAt(0)}`} alt="Profile" className="w-12 h-12 rounded-full object-cover" /><div><p className="font-bold text-lg">{userProfile.name}</p><button onClick={() => { setActiveModal('profile'); setIsMenuOpen(false); }} className="text-xs text-cyan-400">Edit Profile</button></div></div><ul><li onClick={() => { setActiveModal('trends'); setIsMenuOpen(false); }} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer"><TrendingUp size={20} /><span>Trends</span></li><li onClick={() => { setActiveModal('import'); setIsMenuOpen(false); }} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer"><FileText size={20} /><span>Import from Text</span></li><li onClick={handleLogout} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer"><LogOut size={20} /><span>Logout</span></li></ul></div></div>
                {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/50 z-30"></div>}
                <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pb-32">
                    <header className="flex items-center justify-between mb-6"><button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md hover:bg-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button><h1 className="text-xl font-bold text-white tracking-tight">Workout Companion</h1><button onClick={() => setIsMenuOpen(true)} className="p-1 rounded-full hover:bg-gray-700"><img src={userProfile.profilePic || `https://placehold.co/100x100/1f2937/7dd3fc?text=${(userProfile.name || ' ').charAt(0)}`} alt="Profile" className="w-8 h-8 rounded-full object-cover" /></button></header>
                    <div className="flex items-center justify-between bg-gray-800 p-2 rounded-lg mb-8"><button onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() - 1)))} className="p-2 rounded-md hover:bg-gray-700"><ChevronLeft/></button><div className="text-center"><div className="text-lg font-bold text-white">{formatDate(currentDate)}</div>{toYYYYMMDD(new Date()) !== toYYYYMMDD(currentDate) && <button onClick={() => setCurrentDate(new Date())} className="text-xs text-cyan-400 hover:text-cyan-300">Go to Today</button>}</div><button onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() + 1)))} className="p-2 rounded-md hover:bg-gray-700"><ChevronRight/></button></div>
                    <div className="space-y-4">{isWorkoutComplete && (<div className="bg-green-800/50 border border-green-600 text-white p-4 rounded-lg text-center flex items-center justify-center space-x-3"><PartyPopper className="text-green-300" /><div><h3 className="font-bold text-lg">Workout Complete!</h3><p className="text-sm text-green-200">Great job finishing all your exercises for today.</p></div></div>)}{exercisesForDay.length > 0 ? exercisesForDay.map(ex => { let trendIndicator = null; if (ex.type === 'strength') { const prevWeight = findPreviousWeight(ex.name, currentDate); if (prevWeight !== null && ex.targetWeightValue > prevWeight) { const percentIncrease = ((ex.targetWeightValue - prevWeight) / prevWeight) * 100; trendIndicator = (<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-900 text-green-300"><TrendingUp className="w-3 h-3 mr-1" />+{percentIncrease.toFixed(1)}%</span>); } } return (<div key={ex.id} className={dropTarget === ex.id ? 'drop-indicator' : ''}><ExerciseItem exercise={ex} onUpdate={(fields) => updateExercise(ex.id, fields)} onComplete={() => completeExercise(ex.id)} onSkip={(note) => skipExercise(ex.id, note)} onUndo={() => undoExercise(ex.id)} onEdit={() => handleEditExercise(ex)} onShowVisualAid={() => setActiveModal({type: 'visual', exercise: ex})} trend={trendIndicator} onDragStart={(e) => handleDragStart(e, ex)} onDragOver={(e) => handleDragOver(e, ex)} onDrop={(e) => handleDrop(e, ex)} onDragEnd={handleDragEnd} isDragging={draggedItem?.id === ex.id} /></div>)}) : (<div className="text-center py-16 bg-gray-800 rounded-lg flex flex-col items-center justify-center space-y-4"><ClipboardPlus size={48} className="text-gray-500" /><h3 className="text-xl font-semibold text-white">No Workout Planned</h3><p className="text-gray-400 mt-2 max-w-xs">It's a rest day! Or, you can add a new workout to get started.</p><button onClick={() => setActiveModal('add')} className="mt-4 flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg"><Plus size={20} className="mr-2" />Add a Workout</button></div>)}</div>
                </div>
                 <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700"><div className="max-w-2xl mx-auto p-4 flex gap-4"><button onClick={() => setActiveModal('add')} className="w-1/2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg text-base transition-all duration-200 flex items-center justify-center"><Plus size={20} className="mr-2" />Add Exercise</button><button onClick={() => setActiveModal('summary')} className="w-1/2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg text-base transition-all duration-200 flex items-center justify-center"><ClipboardList size={20} className="mr-2" />Review Summary</button></div></div>
                {activeModal === 'profile' && <ProfileModal user={userProfile} onSave={handleSaveProfile} onClose={() => setActiveModal(null)} />}
                {activeModal === 'trends' && <TrendsModal weeklyPlan={weeklyPlan} onClose={() => setActiveModal(null)} />}
                {activeModal === 'import' && <ImportModal existingPlan={weeklyPlan} onImport={handleImportConfirm} onClose={() => setActiveModal(null)} />}
                {activeModal === 'edit' && <EditExerciseModal exercise={editingExercise} onSave={handleSaveEditedExercise} onDelete={handleDeleteExercise} onClose={() => setActiveModal(null)} />}
                {activeModal === 'add' && <AddExerciseModal onAdd={handleAddExercise} onClose={() => setActiveModal(null)} />}
                {activeModal === 'summary' && <SummaryModal summary={generateSummary()} onClose={() => setActiveModal(null)} onCopy={handleCopySummary} />}
                {activeModal?.type === 'visual' && <VisualAidModal exercise={activeModal.exercise} onClose={() => setActiveModal(null)} onDescriptionFetched={handleDescriptionFetched} cachedDescription={exerciseDescriptions[activeModal.exercise.name]} />}
                {toast.show && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white py-2 px-5 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 opacity-100 translate-y-0">{toast.message}</div>}
            </div>
        </>
    );
}
