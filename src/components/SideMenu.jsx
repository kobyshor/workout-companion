// src/components/SideMenu.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { TrendingUp, FileText, LogOut, Library } from 'lucide-react';

const SideMenu = ({ isOpen, onClose, onNavigate }) => {
    const { userProfile, handleLogout } = useAuth();

    const navigateAndClose = (modalName) => {
        onNavigate(modalName);
        onClose();
    };

    const onLogoutClick = () => {
        console.log('[SideMenu] Logout button clicked.');
        handleLogout();
    }

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
                            <button onClick={() => navigateAndClose('profile')} className="text-xs text-cyan-400 hover:underline">Edit Profile</button>
                        </div>
                    </div>

                    <ul>
                        <li onClick={() => navigateAndClose('trends')} className="flex items-center space-x-3 p-2 rounded-md text-gray-200 hover:bg-gray-700 cursor-pointer">
                            <TrendingUp size={20} className="text-cyan-400"/>
                            <span>Trends</span>
                        </li>
                        <li onClick={() => navigateAndClose('import')} className="flex items-center space-x-3 p-2 rounded-md text-gray-200 hover:bg-gray-700 cursor-pointer">
                            <FileText size={20} className="text-cyan-400"/>
                            <span>Import from CSV</span>
                        </li>
                        <li onClick={() => navigateAndClose('manageLibrary')} className="flex items-center space-x-3 p-2 rounded-md text-gray-200 hover:bg-gray-700 cursor-pointer">
                            <Library size={20} className="text-cyan-400"/>
                            <span>Manage Library</span>
                        </li>
                        {/* --- UPDATED: Using a dedicated click handler for logging --- */}
                        <li onClick={onLogoutClick} className="flex items-center space-x-3 p-2 rounded-md text-gray-200 hover:bg-gray-700 cursor-pointer mt-4 border-t border-gray-700 pt-4">
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
