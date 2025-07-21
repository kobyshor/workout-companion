import React, { useState } from 'react';
import { X, UploadCloud, Download } from 'lucide-react';
// Make sure you have installed papaparse: npm install papaparse
import Papa from 'papaparse';

const CSVImportModal = ({ onImport, onClose }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setError('');
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
        } else {
            setError("Please select a valid .csv file.");
            setFile(null);
        }
    };

    const handleImport = () => {
        if (!file) {
            setError("Please select a file to import.");
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setError("Error parsing CSV. Please check the file format.");
                    console.error("CSV Parsing Errors:", results.errors);
                    return;
                }
                // Pass the parsed data to the parent component's handler
                onImport(results.data);
                onClose();
            },
            error: (err) => {
                setError("An unexpected error occurred during parsing.");
                console.error(err);
            }
        });
    };
    
    // The template string for coaches/users to download
    const csvTemplate = "date,exerciseName,type,status,targetSets,targetReps,targetWeight,targetTime,targetDistance,sessionNotes\n2025-07-20,Squat,strength,completed,5,5,100,,,\n2025-07-20,Bench Press,strength,pending,5,5,80,,,\n2025-07-21,Run,cardio,skipped,,,,30,5,Focus on cardio endurance today.";
    
    const downloadTemplate = () => {
        const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "workout_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-4">Import from CSV</h2>
                
                <div className="bg-gray-900 p-4 rounded-md mb-4">
                    <p className="text-sm text-gray-300 mb-2">Upload a CSV file with the required columns. The `exerciseName` must match an exercise in the library.</p>
                    <code className="text-xs text-cyan-300 bg-black/30 p-2 rounded-md block whitespace-pre-wrap">date,exerciseName,type,status,targetSets,targetReps,targetWeight,targetTime,targetDistance,sessionNotes</code>
                    <button onClick={downloadTemplate} className="mt-3 text-sm text-cyan-400 hover:underline flex items-center gap-2">
                        <Download size={16}/>
                        Download Template
                    </button>
                </div>
                
                <div className="mt-4">
                    <label className="w-full flex items-center justify-center px-4 py-6 bg-gray-700 text-gray-400 rounded-lg shadow-lg tracking-wide uppercase border border-dashed border-gray-500 cursor-pointer hover:bg-gray-600 hover:text-white">
                        <UploadCloud size={32} className="mr-4"/>
                        <span className="text-base">{file ? file.name : 'Select a .csv file'}</span>
                        <input type='file' className="hidden" accept=".csv" onChange={handleFileChange} />
                    </label>
                </div>
                
                {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
                    <button onClick={handleImport} disabled={!file} className="bg-green-600 px-4 py-2 rounded disabled:opacity-50">Import</button>
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;
