import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// ====================================================================================
// TODO: PASTE YOUR FIREBASE CONFIGURATION HERE
// ====================================================================================
// 1. Go to your Firebase project console: https://console.firebase.google.com/
// 2. In your project's settings (click the gear icon ⚙️ > Project settings),
//    find your web app's configuration object under the "General" tab.
// 3. Copy the entire object and paste it here, replacing the example configuration below.
// ====================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyC-76r_q6I4TX3scx7mDx6ocGWSTtuMSX8",
  authDomain: "ecomly-ai.firebaseapp.com",
  projectId: "ecomly-ai",
  storageBucket: "ecomly-ai.firebasestorage.app",
  messagingSenderId: "891344479099",
  appId: "1:891344479099:web:e37507bb4e4c879b0e13de",
  measurementId: "G-QYXKPLM12J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services and export them for use in other parts of the app
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { auth, db, functions };
