// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Import the configuration directly from our new config file.
import { firebaseConfig } from '../config/firebaseConfig.js';

// --- DIAGNOSTIC LOG ---
// This will confirm that the config object is now being loaded correctly.
console.log("Imported firebaseConfig object:", firebaseConfig);

// Initialize Firebase App
let app;
let auth;
let db;
let provider;

// Check if the config keys are provided before initializing
if (firebaseConfig && firebaseConfig.apiKey) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        provider = new GoogleAuthProvider();
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn("Firestore persistence failed: Multiple tabs open.");
            } else if (err.code === 'unimplemented') {
                console.warn("Firestore persistence failed: Browser does not support it.");
            }
        });
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
} else {
    console.error("Firebase configuration is missing or invalid in src/config/firebaseConfig.js");
}

// Export the initialized services for use in other parts of the app.
export { auth, db, provider };
