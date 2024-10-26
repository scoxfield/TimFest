// src/firebaseConfig.js

// Importă funcțiile necesare din SDK-urile Firebase
import { initializeApp } from "firebase/app"; // Importă funcția pentru inițializarea aplicației Firebase
import { getFirestore } from "firebase/firestore"; // Importă funcția pentru Firestore
import { getAuth } from "firebase/auth"; // Importă funcția pentru Authentication

// Configurația Firebase (înlocuiește cu noile valori)
const firebaseConfig = {
  apiKey: "AIzaSyD8nCqAMd6o-TSM1M9CAHIwEEO9V1MMD-g",
  authDomain: "timfest-f074e.firebaseapp.com",
  projectId: "timfest-f074e",
  storageBucket: "timfest-f074e.appspot.com",
  messagingSenderId: "895487609221",
  appId: "1:895487609221:web:f81177d5d4fe1ad71b9cec"
};

// Inițializează Firebase
const app = initializeApp(firebaseConfig);

// Initializează Firestore și Authentication
const db = getFirestore(app);
const auth = getAuth(app);

// Exportă serviciile pentru a le folosi în restul aplicației
export { db, auth };
