import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD0Gp7i9b967i3nKPrSLUviqfULQaA0Las",
    authDomain: "project-1caf4.firebaseapp.com",
    databaseURL: "https://project-1caf4-default-rtdb.firebaseio.com",
    projectId: "project-1caf4",
    storageBucket: "project-1caf4.appspot.com",
    messagingSenderId: "221374338641",
    appId: "1:221374338641:web:818b25411c14b18ee74a70",
    measurementId: "G-RFEJ444MKD"
};

// Initialisation unique de Firebase
let app;
let auth;
let db;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };