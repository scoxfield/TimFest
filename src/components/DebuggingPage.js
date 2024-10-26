// src/components/DebuggingPage.js
import React from 'react';
import { db, auth } from '../firebaseConfig'; // Importă configurația Firebase
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importă funcția de autentificare
import { collection, addDoc } from 'firebase/firestore'; // Importă funcțiile pentru Firestore

const DebuggingPage = () => {
  const handleAuthTest = () => {
    // Exemplu de funcție pentru autentificare
    signInWithEmailAndPassword(auth, "test@example.com", "password")
      .then((userCredential) => {
        console.log("Autentificare reușită:", userCredential.user);
      })
      .catch((error) => {
        console.error("Eroare la autentificare:", error);
      });
  };

  const handleFirestoreTest = async () => {
    // Exemplu de testare Firestore
    const testCollectionRef = collection(db, "testCollection"); // Referința la colecția Firestore
    try {
      const docRef = await addDoc(testCollectionRef, {
        exampleField: "Test data"
      });
      console.log("Document adăugat cu succes! ID:", docRef.id);
    } catch (error) {
      console.error("Eroare la adăugarea documentului:", error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Debugging Page</h1>
      <button onClick={handleAuthTest} style={{ margin: '10px', padding: '10px' }}>
        Testează Autentificarea
      </button>
      <button onClick={handleFirestoreTest} style={{ margin: '10px', padding: '10px' }}>
        Testează Firestore
      </button>
    </div>
  );
};

export default DebuggingPage;
