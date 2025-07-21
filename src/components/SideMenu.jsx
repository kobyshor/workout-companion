import React from 'react';
import { TrendingUp, FileText, LogOut, Library } from 'lucide-react';

const SideMenu = ({ userProfile, onLogout, onNavigate, isOpen, onClose }) => {
    return (
        <>
            <div className={`fixed top-0 left-0 h-full bg-gray-800 w-64 z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="p-4">
                    <div className="flex items-center space-x-3 mb-6">
                        <img 
                            src={userProfile?.profilePic || `https://placehold.co/100x100/1f2937/7dd3fc?text=${(userProfile?.name || ' ').charAt(0)}`} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-full object-cover" 
                        />
                        <div>
                            <p className="font-bold text-lg text-white">{userProfile?.name || 'User'}</p>
                            <button onClick={() => onNavigate('profile')} className="text-xs text-cyan-400 hover:underline">Edit Profile</button>
                        </div>
                    </div>

                    <ul>
                        <li onClick={() => onNavigate('trends')} className="flex items-center space-x-3 p-2 rounded-md text-gray-200 hover:bg-gray-700 cursor-pointer">
                            <TrendingUp size={20} className="text-cyan-400"/>
                            <span>Trends</span>
                        </li>
                        <li onClick={() => onNavigate('import')} className="flex items-center space-x-3 p-2 rounded-md text-gray-200 hover:bg-gray-700 cursor-pointer">
                            <FileText size={20} className="text-cyan-400"/>
                            <span>Import from CSV</span>
                        </li>
                        {/* New Menu Item for the Library Manager */}
                        <li onClick={() => onNavigate('manageLibrary')} className="flex items-center space-x-3 p-2 rounded-md text-gray-200 hover:bg-gray-700 cursor-pointer">
                            <Library size={20} className="text-cyan-400"/>
                            <span>Manage Library</span>
                        </li>
                        <li onClick={onLogout} className="flex items-center space-x-3 p-2 rounded-md text-gray-200 hover:bg-gray-700 cursor-pointer mt-4 border-t border-gray-700 pt-4">
                            <LogOut size={20} className="text-red-400"/>
                            <span>Logout</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/50 z-30"></div>}
        </>
    );
};

export default SideMenu;
