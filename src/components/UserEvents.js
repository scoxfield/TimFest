import React, { useEffect, useState } from 'react';
import './UserEvents.css';
import { db } from '../firebaseConfig';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';

const UserEvents = ({ userEmail }) => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [updatedEventData, setUpdatedEventData] = useState({});
  const [showParticipants, setShowParticipants] = useState({}); // Track visibility for each event's participants

  useEffect(() => {
    const eventsCollection = collection(db, 'events');
    const q = query(eventsCollection);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Subscribe to changes for each event to fetch the latest roles
    const unsubscribeRoles = events.map((event) => {
      const eventRef = doc(db, 'events', event.id);
      return onSnapshot(eventRef, (doc) => {
        const updatedEvent = {
          id: doc.id,
          ...doc.data(),
        };

        setEvents((prevEvents) =>
          prevEvents.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
        );
      });
    });

    return () => {
      // Unsubscribe from all role listeners
      unsubscribeRoles.forEach(unsubscribe => unsubscribe());
    };
  }, [events]);

  const handleJoinEvent = async (eventId, budgetPerPerson, isApprovalRequired) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      const participants = eventDoc.data().participants || [];
      const participantLimit = eventDoc.data().participantLimit;

      if (isApprovalRequired) {
        // Add user to pendingParticipants if approval is required
        await updateDoc(eventRef, {
          pendingParticipants: arrayUnion(userEmail),
        });
        alert('Your application to join the event has been submitted. Please wait for organizer approval.');
      } else {
        // If no approval is required, join directly
        if (participants.length < participantLimit) {
          await updateDoc(eventRef, {
            participants: arrayUnion(userEmail),
          });
          alert(`You have successfully joined the event! You need to contribute $${budgetPerPerson} per person.`);
        } else {
          alert('Participant limit reached. You cannot join this event.');
        }
      }
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Error joining event. Please try again.');
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        participants: arrayRemove(userEmail),
        pendingParticipants: arrayRemove(userEmail), // Remove from pending if applicable
      });
      alert('You have left the event.');
    } catch (error) {
      console.error('Error leaving event:', error);
      alert('Error leaving event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await deleteDoc(eventRef);
      alert('Event deleted successfully.');
    } catch (error) {
      console.error('Error deleting event:', error);
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
      accepting: event.accepting,
      isApprovalRequired: event.isApprovalRequired, // Keep this state for editing
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
      console.error('Error updating event:', error);
      alert('Error updating event. Please try again.');
    }
  };

  const handleAcceptParticipant = async (eventId, participantEmail) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        participants: arrayUnion(participantEmail),
        pendingParticipants: arrayRemove(participantEmail),
      });
      alert(`${participantEmail} has been accepted to the event.`);
    } catch (error) {
      console.error('Error accepting participant:', error);
      alert('Error accepting participant. Please try again.');
    }
  };

  const handleRejectParticipant = async (eventId, participantEmail) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        pendingParticipants: arrayRemove(participantEmail),
      });
      alert(`${participantEmail} has been rejected from the event.`);
    } catch (error) {
      console.error('Error rejecting participant:', error);
      alert('Error rejecting participant. Please try again.');
    }
  };

  const handleKickParticipant = async (eventId, participantEmail) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        participants: arrayRemove(participantEmail),
        [`roles.${participantEmail}`]: null, // Clear role if kicked
      });
      alert(`${participantEmail} has been kicked from the event.`);
    } catch (error) {
      console.error('Error kicking participant:', error);
      alert('Error kicking participant. Please try again.');
    }
  };

  const handleRoleAssignment = async (eventId, participantEmail, role) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        [`roles.${participantEmail}`]: role, // Use the email as is for the role
      });
      alert(`Role "${role}" assigned to ${participantEmail}.`);
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Error assigning role. Please try again.');
    }
  };
  
  

  const toggleShowParticipants = (eventId) => {
    setShowParticipants((prevState) => ({
      ...prevState,
      [eventId]: !prevState[eventId],
    }));
  };

  return (
    <div className="events-box">
      <h3>Parties in Timisoara:</h3>
      <br />
      {events.length > 0 ? (
        <ul className="events-list">
          {events.map((event) => {
            const participants = event.participants || [];
            const pendingParticipants = event.pendingParticipants || [];
            const roles = event.roles || {}; // Get the roles for participants

            const hasJoined = participants.includes(userEmail);
            const isPending = pendingParticipants.includes(userEmail);
            const isOrganizer = event.organizer.email === userEmail;

            return (
              <li key={event.id} className="event-item">
                <h4>{event.eventName} - {event.date}</h4>
                <p>{event.description}</p>
                <p>Location: {event.location}</p>
                <p>Theme: {event.theme || 'None'}</p>
                <p>Budget: ${event.budget || 0} per person</p>
                <p>Participants: {participants.length}/{event.participantLimit}</p>
                <p>Status: {event.accepting ? 'Accepting Registrations' : 'Not Accepting'}</p>
                <div className="event-actions">
                  {isOrganizer ? (
                    <>
                      <button onClick={() => handleDeleteEvent(event.id)}>Delete Event</button>
                      <button onClick={() => handleEditEvent(event)}>Edit Event</button>
                      <button onClick={() => toggleShowParticipants(event.id)}>
                        {showParticipants[event.id] ? 'Hide Participants' : 'Show Participants'}
                      </button>
                      {showParticipants[event.id] && (
                        <div>
                            <h5>Participants:</h5>
                            <ul>
                            {participants.map((participantEmail) => {
                                const currentRole = roles[participantEmail] || "No special role"; // Default to "No special role"
                                return (
                                <li key={participantEmail}>
                                    {participantEmail}
                                    <span style={{ marginLeft: '10px' }}>Role: {currentRole}</span>
                                    <select
                                    onChange={(e) => handleRoleAssignment(event.id, participantEmail, e.target.value)}
                                    value={roles[participantEmail] || ""} // Set the value to the current role or empty string
                                    >
                                    <option value="">Select Role</option>
                                    <option value="Se ocupa de bautura">Se ocupa de bautura</option>
                                    <option value="Se ocupa de mancare">Se ocupa de mancare</option>
                                    <option value="Se ocupa de Locatie">Se ocupa de Locatie</option>
                                    <option value="No special role">No special role</option>
                                    </select>
                                    <button onClick={() => handleKickParticipant(event.id, participantEmail)}>Kick</button>
                                </li>
                                );
                            })}
                            </ul>
                            <h5>Pending Participants:</h5>
                            <ul>
                            {pendingParticipants.map((pendingEmail) => (
                                <li key={pendingEmail}>
                                {pendingEmail}
                                <button onClick={() => handleAcceptParticipant(event.id, pendingEmail)}>Accept</button>
                                <button onClick={() => handleRejectParticipant(event.id, pendingEmail)}>Reject</button>
                                </li>
                            ))}
                            </ul>
                        </div>
                        )}
                    </>
                  ) : (
                    <>
                      {isPending ? (
                        <p>Your application is pending approval.</p>
                      ) : hasJoined ? (
                        <button onClick={() => handleLeaveEvent(event.id)}>Leave Event</button>
                      ) : (
                        <button onClick={() => handleJoinEvent(event.id, event.budget, event.isApprovalRequired)}>
                          Join Event
                        </button>
                      )}
                    </>
                  )}
                </div>
                {editingEvent?.id === event.id && (
                  <div>
                    <h4>Edit Event</h4>
                    <label>
                      Event Name:
                      <input
                        type="text"
                        value={updatedEventData.eventName}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, eventName: e.target.value })}
                      />
                    </label>
                    <label>
                      Date:
                      <input
                        type="date"
                        value={updatedEventData.date}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, date: e.target.value })}
                      />
                    </label>
                    <label>
                      Description:
                      <textarea
                        value={updatedEventData.description}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, description: e.target.value })}
                      />
                    </label>
                    <label>
                      Location:
                      <input
                        type="text"
                        value={updatedEventData.location}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, location: e.target.value })}
                      />
                    </label>
                    <label>
                      Theme:
                      <input
                        type="text"
                        value={updatedEventData.theme}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, theme: e.target.value })}
                      />
                    </label>
                    <label>
                      Participant Limit:
                      <input
                        type="number"
                        value={updatedEventData.participantLimit}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, participantLimit: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      Budget:
                      <input
                        type="number"
                        value={updatedEventData.budget}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, budget: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      Accepting:
                      <select
                        value={updatedEventData.accepting}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, accepting: e.target.value === 'true' })}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </label>
                    <label>
                      Approval Required:
                      <select
                        value={updatedEventData.isApprovalRequired}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, isApprovalRequired: e.target.value === 'true' })}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </label>
                    <button onClick={handleUpdateEvent}>Update Event</button>
                    <button onClick={() => setEditingEvent(null)}>Cancel</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No events available.</p>
      )}
    </div>
  );
};

export default UserEvents;
