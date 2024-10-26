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
  const [budget, setBudget] = useState(0);
  const [accepting, setAccepting] = useState(false);
  const [isApprovalRequired, setIsApprovalRequired] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rolePercentages, setRolePercentages] = useState([
    { role: 'Se ocupa de bautura', percentage: 0 },
    { role: 'Se ocupa de mancare', percentage: 0 },
    { role: 'Se ocupa de locatie', percentage: 0 },
  ]);
  const [budgetAllocations, setBudgetAllocations] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userQuery = query(collection(db, 'users'), where('email', '==', userEmail));
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const fullName = `${userData.firstName} ${userData.lastName}`;
          setOrganizerName(fullName);
          setOrganizerEmail(userData.email);
        } else {
          console.error("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userEmail]);

  const handleRolePercentageChange = (index, value) => {
    const newRolePercentages = [...rolePercentages];
    newRolePercentages[index].percentage = Number(value);
    setRolePercentages(newRolePercentages);
  };

  const totalPercentage = () => {
    return rolePercentages.reduce((total, role) => total + role.percentage, 0);
  };

  const validatePercentages = () => {
    return totalPercentage() <= 100;
  };

  const calculateBudgetAllocation = (participantsCount) => {
    const totalBudget = budget * participantsCount;
    const allocations = rolePercentages.map(role => ({
      ...role,
      allocatedBudget: (totalBudget * role.percentage) / 100,
    }));
    setBudgetAllocations(allocations);
    return allocations;
  };

  // Calculate budget allocations whenever budget, participant count, or percentages change
  useEffect(() => {
    if (participantLimit > 0 && budget > 0) {
      calculateBudgetAllocation(participantLimit);
    }
  }, [participantLimit, budget, rolePercentages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePercentages()) {
      setStatusMessage('Percentages must add up to 100% or less.');
      return;
    }
    setStatusMessage('Creating event...');
    setIsSubmitting(true);
    try {
      const eventData = {
        eventName,
        date,
        description,
        isAdult,
        theme,
        location,
        participantLimit,
        budget,
        participants: [], // Start with an empty participants list
        pendingParticipants: [], // New field for pending approvals
        organizer: {
          name: organizerName,
          email: organizerEmail,
        },
        accepting,
        isApprovalRequired, // Add approval requirement
        rolePercentages, // Save role percentages
        budgetAllocations, // Save calculated budget allocations
      };
      await addDoc(collection(db, 'events'), eventData);
      setStatusMessage('Event created successfully!');
      fetchUserEvents(userEmail);
      resetForm();
    } catch (error) {
      console.error("Error creating event:", error);
      setStatusMessage('Error creating event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEventName('');
    setDate('');
    setDescription('');
    setIsAdult(false);
    setTheme('');
    setLocation('');
    setParticipantLimit(0);
    setBudget(0);
    setAccepting(false);
    setIsApprovalRequired(false);
    setRolePercentages([
      { role: 'Se ocupa de bautura', percentage: 0 },
      { role: 'Se ocupa de mancare', percentage: 0 },
      { role: 'Se ocupa de locatie', percentage: 0 },
    ]);
    setBudgetAllocations([]); // Reset budget allocations
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
          onChange={e => setParticipantLimit(Number(e.target.value))} 
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
          onChange={e => setBudget(Number(e.target.value))} 
          min="0" 
          required 
        />
      </label>

      {/* Role Percentage Section */}
      <h4>Role Percentages</h4>
      {rolePercentages.map((roleData, index) => (
        <div key={index}>
          <label>
            Role: {roleData.role}
          </label>
          <label>
            Percentage:
            <input 
              type="number" 
              value={roleData.percentage} 
              onChange={e => handleRolePercentageChange(index, e.target.value)} 
              min="0" 
              max="100" 
              required 
            />
          </label>
        </div>
      ))}

      {/* Display Budget Allocations */}
      <div>
        <h4>Budget Allocations:</h4>
        {budgetAllocations.map((role) => (
          <p key={role.role}>
            {role.role}: ${role.allocatedBudget ? role.allocatedBudget.toFixed(2) : '0.00'}
          </p>
        ))}
      </div>

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

      <div>
        <label>
          <input 
            type="checkbox" 
            checked={isApprovalRequired} 
            onChange={() => setIsApprovalRequired(!isApprovalRequired)} 
          />
          Require organizer approval for participants
        </label>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Event...' : 'Create Event'}
      </button>
      {statusMessage && <p>{statusMessage}</p>}
    </form>
  );
};

export default OrganizeParty;
