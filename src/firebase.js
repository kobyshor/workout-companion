// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1jlts2xQZevR7W71G_6cZvWhzT2MlUqs",
  authDomain: "workout-companion-app.firebaseapp.com",
  projectId: "workout-companion-app",
  storageBucket: "workout-companion-app.firebasestorage.app",
  messagingSenderId: "187661338158",
  appId: "1:187661338158:web:6cb196160755aa249c41bf",
  measurementId: "G-J84C5N9SXH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);