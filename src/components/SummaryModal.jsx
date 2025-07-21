import React from 'react';
import { X } from 'lucide-react';

const SummaryModal = ({ summary, onCopy, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-4">Workout Summary</h2>
                <textarea
                    readOnly
                    value={summary}
                    className="w-full h-64 bg-gray-900 text-gray-200 rounded-lg p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                ></textarea>
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">
                        Close
                    </button>
                    <button onClick={onCopy} className="bg-green-600 px-4 py-2 rounded">
                        Copy to Clipboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
