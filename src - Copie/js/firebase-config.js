import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyD0Gp7i9b967i3nKPrSLUviqfULQaA0Las",
    authDomain: "project-1caf4.firebaseapp.com",
    projectId: "project-1caf4",
    storageBucket: "project-1caf4.appspot.com",
    messagingSenderId: "1042502424189",
    appId: "1:1042502424189:web:c2e3c9734e90e36f1c9e89"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Exporter les instances
export { db, auth, storage }; 