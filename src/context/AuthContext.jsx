import React, { createContext, useContext, useState, useEffect } from 'react';
import initialUserData from '../data/userData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const storedUsers = localStorage.getItem('tymbark_users');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    // Set up our initial mock user (Ania Nowak)
    const defaultUser = {
      ...initialUserData,
      email: 'ania@tymbark.pl',
      password: 'haslo123', // Simple mock password
      id: 'usr-1',
    };
    const initialUsersList = [defaultUser];
    localStorage.setItem('tymbark_users', JSON.stringify(initialUsersList));
    return initialUsersList;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('tymbark_session');
    return session ? JSON.parse(session) : null;
  });

  // Sync users list to localStorage
  useEffect(() => {
    localStorage.setItem('tymbark_users', JSON.stringify(users));
  }, [users]);

  // Sync currentUser session to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tymbark_session', JSON.stringify(currentUser));
      // Update this user inside our users database list
      setUsers(prevUsers => 
        prevUsers.map(u => u.email === currentUser.email ? currentUser : u)
      );
    } else {
      localStorage.removeItem('tymbark_session');
    }
  }, [currentUser]);

  // Login method
  const login = (email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    const foundUser = users.find(u => u.email === normalizedEmail && u.password === password);
    
    if (foundUser) {
      setCurrentUser(foundUser);
      return { success: true };
    }
    return { success: false, error: 'Niepoprawny e-mail lub hasło.' };
  };

  // Registration method
  const register = (name, email, password, village) => {
    const normalizedEmail = email.toLowerCase().trim();
    const emailExists = users.some(u => u.email === normalizedEmail);
    
    if (emailExists) {
      return { success: false, error: 'Ten adres e-mail jest już zajęty.' };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      village: village || 'Tymbark',
      points: 0,
      nextRewardThreshold: 500,
      stats: {
        reports: 0,
        initiatives: 0,
        votes: 0,
      },
      joinedEvents: [],
      rewards: [
        {
          id: 'r1',
          title: 'Piekarnia u Kasi',
          discount: '-15%',
          description: 'Na wszystkie wypieki',
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          emoji: '🥐',
        },
        {
          id: 'r2',
          title: 'Restauracja Pod Lipą',
          discount: '-10%',
          description: 'Na obiady w tygodniu',
          validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          emoji: '🍽️',
        },
        {
          id: 'r3',
          title: 'Sklep Ogrodniczy',
          discount: '-20%',
          description: 'Na nasiona i sadzonki',
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          emoji: '🌱',
        },
      ],
      recentBadge: null,
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  // Logout method
  const logout = () => {
    setCurrentUser(null);
  };

  // General add points method
  const addPoints = (amount, activityType = '') => {
    if (!currentUser) return;
    
    setCurrentUser(prevUser => {
      const updatedPoints = prevUser.points + amount;
      const updatedStats = { ...prevUser.stats };
      
      if (activityType === 'report') updatedStats.reports += 1;
      if (activityType === 'initiative') updatedStats.initiatives += 1;
      if (activityType === 'vote') updatedStats.votes += 1;

      return {
        ...prevUser,
        points: updatedPoints,
        stats: updatedStats
      };
    });
  };

  // Join Event method
  const joinEvent = (eventData) => {
    if (!currentUser) return;

    // Check if already joined
    const alreadyJoined = currentUser.joinedEvents.some(e => e.id === eventData.id);
    if (alreadyJoined) return;

    setCurrentUser(prevUser => {
      // Create date object out of whatever format we receive
      const eventDate = eventData.date instanceof Date 
        ? eventData.date 
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow if parsing is complex

      const newEvent = {
        id: eventData.id.toString(),
        title: eventData.title,
        date: eventDate,
        location: eventData.location || 'Tymbark',
      };

      return {
        ...prevUser,
        points: prevUser.points + 20, // +20 points for joining community events!
        joinedEvents: [...prevUser.joinedEvents, newEvent]
      };
    });
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, addPoints, joinEvent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
