// src/components/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { auth } from '../firebaseConfig'; // Import Firebase config
import { signOut } from 'firebase/auth';
import UserEvents from './UserEvents'; // UserEvents component for displaying user's events
import OrganizeParty from './OrganizeParty'; // OrganizeParty component for creating a new event
import { collection, query, where, getDocs } from 'firebase/firestore'; // Firestore functions
import { db } from '../firebaseConfig'; // Firestore database instance
import './DashboardPage.css';

const DashboardPage = ({ history }) => {
  const [userEmail, setUserEmail] = useState('');
  const [events, setEvents] = useState([]);
  const [showOrganizeForm, setShowOrganizeForm] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email); // Set user email
        await fetchUserEvents(user.uid); // Fetch user's events
      } else {
        history.push('/login'); // Redirect to login if no user
      }
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [history]);

  const fetchUserEvents = async (userId) => {
    try {
      const eventsRef = collection(db, 'events'); // Reference to the 'events' collection
      const q = query(eventsRef, where('organizer', '==', userEmail)); // Query to get user's events
      const querySnapshot = await getDocs(q); // Execute the query
      const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsList); // Update state with user's events
      console.log("Fetched events:", eventsList); // Debugging log
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      history.push('/login'); // Redirect to login
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const toggleOrganizeForm = () => {
    setShowOrganizeForm(prev => !prev); // Toggle the form visibility
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome, {userEmail}!</h2>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={toggleOrganizeForm}>
        {showOrganizeForm ? 'Cancel' : 'Organize a Party'}
      </button>
      {showOrganizeForm ? (
        <OrganizeParty userEmail={userEmail} fetchUserEvents={fetchUserEvents} />
      ) : (
        <div className="events-section">
          <UserEvents events={events} userEmail={userEmail} /> {/* Pass userEmail */}
        </div>
      )}
    </div>
  );
};

export default withRouter(DashboardPage);
