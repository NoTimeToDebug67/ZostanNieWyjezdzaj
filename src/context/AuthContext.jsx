import React, { createContext, useContext, useState, useEffect } from 'react';
import initialUserData from '../data/userData';
import { supabase } from '../lib/supabaseClient';
import mockEvents from '../data/mockEvents';

const AuthContext = createContext();

// Check if Supabase keys are provided and are not the placeholder strings
const isSupabaseActive = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY && 
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project-id');

export function AuthProvider({ children }) {
  // --- MOCK LOCALSTORAGE FALLBACK ENGINE ---
  const [users, setUsers] = useState(() => {
    if (isSupabaseActive) return [];
    const storedUsers = localStorage.getItem('tymbark_users');
    if (storedUsers) return JSON.parse(storedUsers);
    const defaultUser = {
      ...initialUserData,
      email: 'ania@tymbark.pl',
      password: 'haslo123',
      id: 'usr-1',
    };
    const initialUsersList = [defaultUser];
    localStorage.setItem('tymbark_users', JSON.stringify(initialUsersList));
    return initialUsersList;
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync mock users to LocalStorage
  useEffect(() => {
    if (!isSupabaseActive) {
      localStorage.setItem('tymbark_users', JSON.stringify(users));
    }
  }, [users]);

  // --- SUPABASE SESSION LISTENER & LOADER ---
  useEffect(() => {
    // Initialize mock events in localStorage if they don't exist or are outdated
    const stored = localStorage.getItem('tymbark_events');
    if (!stored || JSON.parse(stored).length < 100 || !JSON.parse(stored).some(e => e.id === 'past-1')) {
      localStorage.setItem('tymbark_events', JSON.stringify(mockEvents));
    }

    if (!isSupabaseActive) {
      // Migrate mock database users in localStorage if they don't have past events loaded
      const storedUsersStr = localStorage.getItem('tymbark_users');
      if (storedUsersStr) {
        const parsedUsers = JSON.parse(storedUsersStr);
        let updatedAny = false;
        const migrated = parsedUsers.map(u => {
          if (u.email === 'ania@tymbark.pl') {
            if (!u.joinedEvents) u.joinedEvents = [];
            if (!u.joinedEvents.some(e => e.id === 'past-1')) {
              u.joinedEvents.push({
                id: 'past-1',
                title: 'Warsztaty Pieczenia Chleba KGW',
                date: new Date('2026-06-12T10:00:00').toISOString(),
                location: 'Świetlica Wiejska, Piekiełko'
              });
              updatedAny = true;
            }
            if (!u.joinedEvents.some(e => e.id === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')) {
              u.joinedEvents.push({
                id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
                title: 'Sąsiedzkie Repair Cafe w remizie',
                date: new Date('2026-06-15T15:00:00').toISOString(),
                location: 'Remiza OSP Tymbark'
              });
              updatedAny = true;
            }
          }
          return u;
        });
        if (updatedAny) {
          localStorage.setItem('tymbark_users', JSON.stringify(migrated));
          setUsers(migrated);
        }
      }

      // LocalStorage Mock Initialization
      const session = localStorage.getItem('tymbark_session');
      if (session) {
        const parsedUser = JSON.parse(session);
        // Force inject past events so they are immediately available for mock chat demo!
        if (!parsedUser.joinedEvents) {
          parsedUser.joinedEvents = [];
        }
        if (!parsedUser.joinedEvents.some(e => e.id === 'past-1')) {
          parsedUser.joinedEvents.push({
            id: 'past-1',
            title: 'Warsztaty Pieczenia Chleba KGW',
            date: new Date('2026-06-12T10:00:00').toISOString(),
            location: 'Świetlica Wiejska, Piekiełko'
          });
        }
        if (!parsedUser.joinedEvents.some(e => e.id === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')) {
          parsedUser.joinedEvents.push({
            id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
            title: 'Sąsiedzkie Repair Cafe w remizie',
            date: new Date('2026-06-15T15:00:00').toISOString(),
            location: 'Remiza OSP Tymbark'
          });
        }
        setCurrentUser(parsedUser);
        localStorage.setItem('tymbark_session', JSON.stringify(parsedUser));
      }
      setLoading(false);
      return;
    }

    console.log('Supabase jest aktywny. Ładowanie sesji chmurowej...');

    // 1. Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchSupabaseProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen to Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        fetchSupabaseProfile(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch full user data from Supabase DB tables (profiles + joined_events)
  const fetchSupabaseProfile = async (authUser) => {
    try {
      setLoading(true);
      // Fetch profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileErr) throw profileErr;

      // Fetch joined events
      const { data: events, error: eventsErr } = await supabase
        .from('joined_events')
        .select('*')
        .eq('user_id', authUser.id);

      if (eventsErr) throw eventsErr;

      // Map events to the structure our components expect
      const formattedEvents = events.map(e => ({
        id: e.event_id,
        title: e.title,
        date: new Date(e.date),
        location: e.location,
      }));

      // Set combined user state
      setCurrentUser({
        id: authUser.id,
        email: authUser.email,
        name: profile.name,
        village: profile.village,
        points: profile.points,
        nextRewardThreshold: 500,
        stats: {
          reports: profile.reports_count,
          initiatives: profile.initiatives_count,
          votes: profile.votes_count,
        },
        joinedEvents: formattedEvents,
        // Mock rewards for the demo
        rewards: [
          {
            id: 'r1',
            title: 'Piekarnia u Kasi',
            discount: '-15%',
            description: 'Na wszystkie wypieki',
            validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            emoji: '🥐',
          },
          {
            id: 'r2',
            title: 'Restauracja Pod Lipą',
            discount: '-10%',
            description: 'Na obiady w tygodniu',
            validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            emoji: '🍽️',
          },
          {
            id: 'r3',
            title: 'Sklep Ogrodniczy',
            discount: '-20%',
            description: 'Na nasiona i sadzonki',
            validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            emoji: '🌱',
          },
        ],
        recentBadge: null,
      });
    } catch (err) {
      console.error('Błąd podczas wczytywania profilu Supabase:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ENGINE (SUPABASE OR MOCK LOCALSTORAGE) ---

  // 1. Login
  const login = async (email, password) => {
    if (!isSupabaseActive) {
      // Mock login
      const normalizedEmail = email.toLowerCase().trim();
      const foundUser = users.find(u => u.email === normalizedEmail && u.password === password);
      
      if (foundUser) {
        setCurrentUser(foundUser);
        localStorage.setItem('tymbark_session', JSON.stringify(foundUser));
        return { success: true };
      }
      return { success: false, error: 'Niepoprawny e-mail lub hasło (Mock).' };
    }

    // Real Supabase Login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 2. Registration
  const register = async (name, email, password, village) => {
    if (!isSupabaseActive) {
      // Mock register
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
            validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            emoji: '🥐',
          },
          {
            id: 'r2',
            title: 'Restauracja Pod Lipą',
            discount: '-10%',
            description: 'Na obiady w tygodniu',
            validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            emoji: '🍽️',
          },
          {
            id: 'r3',
            title: 'Sklep Ogrodniczy',
            discount: '-20%',
            description: 'Na nasiona i sadzonki',
            validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            emoji: '🌱',
          },
        ],
        recentBadge: null,
      };

      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem('tymbark_session', JSON.stringify(newUser));
      return { success: true };
    }

    // Real Supabase Register (with PostgreSQL profile trigger)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            village: village,
          },
        },
      });

      if (error) throw error;
      
      // Note: If email confirmation is enabled in Supabase settings, the user must check their inbox.
      // If disabled, they are logged in immediately.
      return { 
        success: true, 
        message: data.user?.identities?.length === 0 
          ? 'Konto już istnieje w bazie.' 
          : 'Rejestracja pomyślna! Sprawdź e-mail w celu aktywacji konta (jeśli wymagana).'
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 3. Logout
  const logout = async () => {
    if (!isSupabaseActive) {
      setCurrentUser(null);
      localStorage.removeItem('tymbark_session');
      return;
    }

    await supabase.auth.signOut();
  };

  // 4. Add Points
  const addPoints = async (amount, activityType = '') => {
    if (!currentUser) return;

    if (!isSupabaseActive) {
      // Mock add points
      const updatedUser = {
        ...currentUser,
        points: currentUser.points + amount,
        stats: {
          ...currentUser.stats,
          reports: activityType === 'report' ? currentUser.stats.reports + 1 : currentUser.stats.reports,
          initiatives: activityType === 'initiative' ? currentUser.stats.initiatives + 1 : currentUser.stats.initiatives,
          votes: activityType === 'vote' ? currentUser.stats.votes + 1 : currentUser.stats.votes,
        }
      };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u));
      return;
    }

    // Real Supabase points update
    try {
      const updatedStats = { ...currentUser.stats };
      const updates = {
        points: currentUser.points + amount,
      };

      if (activityType === 'report') {
        updates.reports_count = currentUser.stats.reports + 1;
        updatedStats.reports += 1;
      }
      if (activityType === 'initiative') {
        updates.initiatives_count = currentUser.stats.initiatives + 1;
        updatedStats.initiatives += 1;
      }
      if (activityType === 'vote') {
        updates.votes_count = currentUser.stats.votes + 1;
        updatedStats.votes += 1;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);

      if (error) throw error;

      // Update state locally
      setCurrentUser(prev => ({
        ...prev,
        points: prev.points + amount,
        stats: updatedStats
      }));
    } catch (err) {
      console.error('Błąd podczas dodawania punktów w Supabase:', err.message);
    }
  };

  // 5. Join Event
  const joinEvent = async (eventData) => {
    if (!currentUser) return;

    const alreadyJoined = currentUser.joinedEvents.some(e => e.id.toString() === eventData.id.toString());
    if (alreadyJoined) return;

    const eventDateObj = eventData.date instanceof Date ? eventData.date : new Date(eventData.date);

    if (!isSupabaseActive) {
      // Mock join event
      const updatedUser = {
        ...currentUser,
        points: currentUser.points + 20,
        joinedEvents: [
          ...currentUser.joinedEvents,
          {
            id: eventData.id.toString(),
            title: eventData.title,
            date: eventDateObj,
            location: eventData.location || 'Tymbark',
          }
        ]
      };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u));

      // Increment mock event attendees count
      const storedEvents = localStorage.getItem('tymbark_events');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        const updatedEvents = parsedEvents.map(e => {
          if (e.id.toString() === eventData.id.toString()) {
            return { ...e, attendees_count: (e.attendees_count || 0) + 1 };
          }
          return e;
        });
        localStorage.setItem('tymbark_events', JSON.stringify(updatedEvents));
      }
      return;
    }

    // Real Supabase Event Signup
    try {
      // Insert joined_events row
      const { error: eventErr } = await supabase
        .from('joined_events')
        .insert({
          user_id: currentUser.id,
          event_id: eventData.id.toString(),
          title: eventData.title,
          date: eventDateObj.toISOString(),
          location: eventData.location || 'Tymbark',
        });

      if (eventErr) throw eventErr;

      // Increment event attendees count in Supabase
      const { data: eventRow } = await supabase
        .from('events')
        .select('attendees_count')
        .eq('id', eventData.id.toString())
        .single();
      
      const newCount = (eventRow?.attendees_count || 0) + 1;

      await supabase
        .from('events')
        .update({ attendees_count: newCount })
        .eq('id', eventData.id.toString());

      // Add points for signup
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ points: currentUser.points + 20 })
        .eq('id', currentUser.id);

      if (profileErr) throw profileErr;

      // Update state locally
      setCurrentUser(prev => ({
        ...prev,
        points: prev.points + 20,
        joinedEvents: [
          ...prev.joinedEvents,
          {
            id: eventData.id.toString(),
            title: eventData.title,
            date: eventDateObj,
            location: eventData.location || 'Tymbark',
          }
        ]
      }));
    } catch (err) {
      console.error('Błąd podczas zapisu na wydarzenie w Supabase:', err.message);
    }
  };

  // 6. Leave Event
  const leaveEvent = async (eventId) => {
    if (!currentUser) return;

    const joined = currentUser.joinedEvents.some(e => e.id.toString() !== eventId.toString());
    // (Ensure we actually joined it first)
    const alreadyJoined = currentUser.joinedEvents.some(e => e.id.toString() === eventId.toString());
    if (!alreadyJoined) return;

    if (!isSupabaseActive) {
      // Mock leave event
      const updatedUser = {
        ...currentUser,
        points: Math.max(0, currentUser.points - 20),
        joinedEvents: currentUser.joinedEvents.filter(e => e.id.toString() !== eventId.toString())
      };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u));

      // Decrement mock event attendees count
      const storedEvents = localStorage.getItem('tymbark_events');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        const updatedEvents = parsedEvents.map(e => {
          if (e.id.toString() === eventId.toString()) {
            return { ...e, attendees_count: Math.max(0, (e.attendees_count || 1) - 1) };
          }
          return e;
        });
        localStorage.setItem('tymbark_events', JSON.stringify(updatedEvents));
      }
      return;
    }

    // Real Supabase Event Unsignup
    try {
      // Delete joined_events row
      const { error: eventErr } = await supabase
        .from('joined_events')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('event_id', eventId.toString());

      if (eventErr) throw eventErr;

      // Decrement event attendees count in Supabase
      const { data: eventRow } = await supabase
        .from('events')
        .select('attendees_count')
        .eq('id', eventId.toString())
        .single();
      
      const newCount = Math.max(0, (eventRow?.attendees_count || 1) - 1);

      await supabase
        .from('events')
        .update({ attendees_count: newCount })
        .eq('id', eventId.toString());

      // Deduct points
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ points: Math.max(0, currentUser.points - 20) })
        .eq('id', currentUser.id);

      if (profileErr) throw profileErr;

      // Update state locally
      setCurrentUser(prev => ({
        ...prev,
        points: Math.max(0, prev.points - 20),
        joinedEvents: prev.joinedEvents.filter(e => e.id.toString() !== eventId.toString())
      }));
    } catch (err) {
      console.error('Błąd podczas wypisywania się z wydarzenia w Supabase:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, addPoints, joinEvent, leaveEvent, isSupabaseActive, loading }}>
      {!loading && children}
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
