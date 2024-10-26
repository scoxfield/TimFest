// src/components/OrganizeParty.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import './OrganizeParty.css';

const OrganizeParty = ({ userEmail, fetchUserEvents }) => {
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [isAdult, setIsAdult] = useState(false);
  const [theme, setTheme] = useState('');
  const [location, setLocation] = useState('');
  const [participantLimit, setParticipantLimit] = useState(0);
  const [budget, setBudget] = useState(0); // New state for budget
  const [accepting, setAccepting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Query to find user by email
        const userQuery = query(collection(db, 'users'), where('email', '==', userEmail));
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const fullName = `${userData.firstName} ${userData.lastName}`;
          setOrganizerName(fullName);
          setOrganizerEmail(userData.email); // Fetch the user's email
        } else {
          console.error("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('Creating event...');
    setAccepting(true);
    try {
      const eventData = {
        eventName,
        date,
        description,
        isAdult,
        theme,
        location,
        participantLimit,
        budget, // Include budget in event data
        participants: [organizerEmail], // Automatically add organizer as participant
        organizer: {
          name: organizerName, // Use fetched organizer name
          email: organizerEmail, // Use fetched organizer email
        },
        accepting, // Indicates if the event is accepting registrations
      };
      await addDoc(collection(db, 'events'), eventData);
      setStatusMessage('Event created successfully!');
      fetchUserEvents(userEmail); // Fetch updated user events
    } catch (error) {
      console.error("Error creating event:", error);
      setStatusMessage('Error creating event. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <form className="organize-party-form" onSubmit={handleSubmit}>
      <h3>Organize a Party</h3>

      <label>
        Event Name:
        <input 
          type="text" 
          placeholder="Enter event name" 
          value={eventName} 
          onChange={e => setEventName(e.target.value)} 
          required 
        />
      </label>

      <label>
        Date:
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          required 
        />
      </label>

      <label>
        Description:
        <textarea 
          placeholder="Enter event description" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          required 
        />
      </label>

      <label>
        Age Restriction:
        <select onChange={e => setIsAdult(e.target.value === 'true')} required>
          <option value="false">Family Friendly</option>
          <option value="true">Adults Only</option>
        </select>
      </label>

      <label>
        Theme:
        <input 
          type="text" 
          placeholder="Enter theme (optional)" 
          value={theme} 
          onChange={e => setTheme(e.target.value)} 
        />
      </label>

      <label>
        Participant Limit:
        <input 
          type="number" 
          placeholder="Max number of participants" 
          value={participantLimit} 
          onChange={e => setParticipantLimit(Number(e.target.value))} // Ensure this is a number
          min="1" 
          required 
        />
      </label>

      <label>
        Location (visible only if participating):
        <input 
          type="text" 
          placeholder="Enter location" 
          value={location} 
          onChange={e => setLocation(e.target.value)} 
        />
      </label>

      <label>
        Budget per Person:
        <input 
          type="number" 
          placeholder="Enter budget per person" 
          value={budget} 
          onChange={e => setBudget(Number(e.target.value))} // Ensure this is a number
          min="0" 
          required 
        />
      </label>

      <div>
        <label>
          <input 
            type="checkbox" 
            checked={accepting} 
            onChange={() => setAccepting(!accepting)} 
          />
          Accept registrations
        </label>
      </div>

      <button type="submit" disabled={accepting}>
        {accepting ? 'Waiting to be accepted...' : 'Create Event'}
      </button>
      {statusMessage && <p>{statusMessage}</p>}
    </form>
  );
};

export default OrganizeParty;
