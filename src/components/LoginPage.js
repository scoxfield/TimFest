// src/components/LoginPage.js
import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig'; // Import Firebase configuration
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, setPersistence, browserLocalPersistence } from 'firebase/auth'; // Import necessary authentication functions
import { setDoc, doc } from 'firebase/firestore'; // Import Firestore functions
import { CSSTransition } from 'react-transition-group';
import { withRouter } from 'react-router-dom'; // Import withRouter
import './LoginPage.css'; // Import styles for LoginPage

const LoginPage = ({ history }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(true); // State for transition

  // Fields for registration
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');

  const calculateAdultStatus = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();
    
    // Check if the user is 18 or older
    return (age > 18 || (age === 18 && monthDifference >= 0)) ? 1 : 0;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfoMessage('');

    // Set authentication persistence
    await setPersistence(auth, browserLocalPersistence); // Set persistence to local

    if (isLoginMode) {
      // Login
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          setError('Te rugăm să-ți verifici emailul înainte de a te conecta.');
          await auth.signOut(); // Sign out user
          return;
        }

        console.log('Autentificare reușită!');
        setShow(false); // Prepare for transition
        setTimeout(() => {
          history.push('/dashboard'); // Redirect to dashboard
        }, 300); // Wait for the animation to finish
      } catch (err) {
        setError(err.message);
        console.error("Eroare la autentificare:", err);
      }
    } else {
      // Registration
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Calculate adult status
        const isAdult = calculateAdultStatus(birthDate);

        // Save details in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          birthDate,
          gender,
          email,
          adult: isAdult // Add "Adult" field
        });

        // Send email verification
        await sendEmailVerification(user);
        await auth.signOut(); // Sign out user

        setInfoMessage('Înregistrare reușită! Te rugăm să-ți verifici emailul pentru a activa contul.');
        console.log('Înregistrare reușită!');
      } catch (err) {
        setError(err.message);
        console.error("Eroare la înregistrare:", err);
      }
    }

    setLoading(false); // Disable loading
  };

  return (
    <CSSTransition
      in={show}
      timeout={300}
      classNames="fade" // Use a fade effect for the transition
      unmountOnExit
    >
      <div className="login-container">
        <h2>{isLoginMode ? 'Autentificare' : 'Înregistrare'}</h2>
        {error && <p className="error-message">{error}</p>}
        {infoMessage && <p className="info-message">{infoMessage}</p>}
        <form onSubmit={handleAuth}>
          {!isLoginMode && (
            <>
              <div className="form-group">
                <label>Prenume:</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Nume:</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Data de naștere:</label>
                <input 
                  type="date" 
                  value={birthDate} 
                  onChange={(e) => setBirthDate(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Sex:</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="">Selectează</option>
                  <option value="male">Masculin</option>
                  <option value="female">Femin</option>
                  <option value="other">Altul</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Parolă:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Încărcare...' : (isLoginMode ? 'Conectare' : 'Înregistrare')}
          </button>
        </form>
        <p className="toggle-text" onClick={() => setIsLoginMode(!isLoginMode)}>
          {isLoginMode ? 'Îți faci un cont?' : 'Ai deja un cont?'}
        </p>
      </div>
    </CSSTransition>
  );
};

export default withRouter(LoginPage);
