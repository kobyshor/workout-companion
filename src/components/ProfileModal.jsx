import React, { useState, useMemo } from 'react';
import { X, Camera, Trophy } from 'lucide-react';

const ProfileModal = ({ user, weeklyPlan, onSave, onClose }) => {
    const [profileData, setProfileData] = useState(user);

    // Calculate Personal Bests from the workout history
    const personalBests = useMemo(() => {
        const pbs = {
            'Bench Press': 0,
            'Squat': 0,
            'Deadlift': 0,
            'Run': 0, // For longest distance
        };
        
        Object.values(weeklyPlan).forEach(day => {
            day.exercises?.forEach(ex => {
                if (ex.status !== 'pending' && ex.status !== 'skipped' && pbs.hasOwnProperty(ex.name)) {
                    if (ex.type === 'strength') {
                        const maxWeight = Math.max(...(ex.actualSets?.map(s => parseFloat(s.weight) || 0) || [0]), parseFloat(ex.targetWeightValue) || 0);
                        if (maxWeight > pbs[ex.name]) {
                            pbs[ex.name] = maxWeight;
                        }
                    } else if (ex.type === 'cardio' && ex.name === 'Run') {
                         const distance = parseFloat(ex.actualDistance) || parseFloat(ex.targetDistance) || 0;
                         if(distance > pbs[ex.name]) {
                            pbs[ex.name] = distance;
                         }
                    }
                }
            });
        });
        return pbs;
    }, [weeklyPlan]);

    const handleSave = () => {
        onSave(profileData);
        onClose();
    };

    const handlePicChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileData({ ...profileData, profilePic: URL.createObjectURL(e.target.files[0]) });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
                
                <div className="flex items-center space-x-4 mb-6">
                    {/* Fixed aspect ratio for the image container to prevent stretching */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <img 
                            src={profileData.profilePic || `https://placehold.co/100x100/1f2937/7dd3fc?text=${(profileData.name || ' ').charAt(0)}`} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full object-cover" 
                        />
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

                {/* Personal Bests Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-cyan-400 flex items-center"><Trophy size={20} className="mr-2"/>Personal Bests</h3>
                    <div className="bg-gray-900/50 p-3 rounded-lg grid grid-cols-2 gap-x-4 gap-y-2">
                        {Object.entries(personalBests).map(([name, value]) => (
                            <div key={name} className="flex justify-between text-sm">
                                <span className="text-gray-300">{name}:</span>
                                <span className="font-semibold text-white">{value > 0 ? `${value}${name === 'Run' ? ' km' : ' kg'}` : '-'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-2"><button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button><button onClick={handleSave} className="bg-cyan-600 px-4 py-2 rounded">Save</button></div>
            </div>
        </div>
    );
};

export default ProfileModal;
