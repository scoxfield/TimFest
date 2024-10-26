// src/components/UserEvents.js
import React, { useEffect, useState } from 'react';
import './UserEvents.css';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, getDoc, deleteDoc } from 'firebase/firestore';

const UserEvents = ({ userEmail }) => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [updatedEventData, setUpdatedEventData] = useState({});

  useEffect(() => {
    const eventsCollection = collection(db, 'events');
    const q = query(eventsCollection);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, []);

  const handleJoinEvent = async (eventId, budgetPerPerson) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      const participants = eventDoc.data().participants || [];
      const participantLimit = eventDoc.data().participantLimit;

      if (participants.length < participantLimit) {
        await updateDoc(eventRef, {
          participants: arrayUnion(userEmail),
        });
        alert(`You have successfully joined the event! You need to contribute $${budgetPerPerson} per person.`);
      } else {
        alert('Participant limit reached. You cannot join this event.');
      }
    } catch (error) {
      console.error("Error joining event:", error);
      alert('Error joining event. Please try again.');
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        participants: arrayRemove(userEmail),
      });
      alert('You have left the event.');
    } catch (error) {
      console.error("Error leaving event:", error);
      alert('Error leaving event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await deleteDoc(eventRef);
      alert('Event deleted successfully.');
    } catch (error) {
      console.error("Error deleting event:", error);
      alert('Error deleting event. Please try again.');
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setUpdatedEventData({
      eventName: event.eventName,
      date: event.date,
      description: event.description,
      isAdult: event.isAdult,
      theme: event.theme,
      location: event.location,
      participantLimit: event.participantLimit,
      budget: event.budget,
    });
  };

  const handleUpdateEvent = async () => {
    try {
      const eventRef = doc(db, 'events', editingEvent.id);
      await updateDoc(eventRef, updatedEventData);
      alert('Event updated successfully.');
      setEditingEvent(null);
      setUpdatedEventData({});
    } catch (error) {
      console.error("Error updating event:", error);
      alert('Error updating event. Please try again.');
    }
  };

  return (
    <div className="events-box">
      <h3>Parties in Timisoara:</h3> {/* Ensure this line appears only once */}
      <br></br>
      {events.length > 0 ? (
        <ul className="events-list">
          {events.map(event => {
            const participants = event.participants || [];
            const hasJoined = participants.includes(userEmail);
            const isOrganizer = event.organizer.email === userEmail; // Check if user is the organizer

            return (
              <li key={event.id} className="event-item">
                <h4>{event.eventName}</h4>
                <p>Date: {event.date}</p>
                <p>{event.description}</p>
                <p>Participant Limit: {event.participantLimit}</p>
                <p>Current Participants: {participants.length} / {event.participantLimit}</p>
                <p>Budget per Person: ${event.budget}</p> {/* Updated to use event.budget */}
                {hasJoined && (
                  <>
                    <p>Organizer: {event.organizer.name} ({event.organizer.email})</p>
                    <p>Location: {event.location}</p>
                  </>
                )}
                {hasJoined && !isOrganizer ? (
                  <div>
                    <button disabled style={{ backgroundColor: '#ccc', cursor: 'not-allowed' }}>
                      You joined this event
                    </button>
                    <button onClick={() => handleLeaveEvent(event.id)} style={{ marginLeft: '10px' }}>
                      Leave
                    </button>
                  </div>
                ) : !hasJoined ? (
                  <button onClick={() => handleJoinEvent(event.id, event.budget)}>
                    Join
                  </button>
                ) : (
                  isOrganizer && (
                    <div>
                      <button onClick={() => handleEditEvent(event)} style={{ marginRight: '10px' }}>
                        Edit Event
                      </button>
                      <button onClick={() => handleDeleteEvent(event.id)} style={{ backgroundColor: 'red', color: 'white' }}>
                        Delete Event
                      </button>
                    </div>
                  )
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No parties available.</p>
      )}
      {editingEvent && (
        <div className="edit-event-form">
          <h4>Edit Event: {editingEvent.eventName}</h4>
          <label>
            Event Name:
            <input
              type="text"
              value={updatedEventData.eventName}
              onChange={e => setUpdatedEventData({ ...updatedEventData, eventName: e.target.value })}
              required
            />
          </label>
          <label>
            Date:
            <input
              type="date"
              value={updatedEventData.date}
              onChange={e => setUpdatedEventData({ ...updatedEventData, date: e.target.value })}
              required
            />
          </label>
          <label>
            Description:
            <textarea
              value={updatedEventData.description}
              onChange={e => setUpdatedEventData({ ...updatedEventData, description: e.target.value })}
              required
            />
          </label>
          <label>
            Age Restriction:
            <select
              value={updatedEventData.isAdult}
              onChange={e => setUpdatedEventData({ ...updatedEventData, isAdult: e.target.value === 'true' })}
              required
            >
              <option value="false">Family Friendly</option>
              <option value="true">Adults Only</option>
            </select>
          </label>
          <label>
            Theme:
            <input
              type="text"
              value={updatedEventData.theme}
              onChange={e => setUpdatedEventData({ ...updatedEventData, theme: e.target.value })}
            />
          </label>
          <label>
            Participant Limit:
            <input
              type="number"
              value={updatedEventData.participantLimit}
              onChange={e => setUpdatedEventData({ ...updatedEventData, participantLimit: Number(e.target.value) })}
              min="1"
              required
            />
          </label>
          <label>
            Budget per Person:
            <input
              type="number"
              value={updatedEventData.budget}
              onChange={e => setUpdatedEventData({ ...updatedEventData, budget: Number(e.target.value) })}
              min="0"
              required
            />
          </label>
          <button onClick={handleUpdateEvent}>Update Event</button>
          <button onClick={() => setEditingEvent(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default UserEvents;
