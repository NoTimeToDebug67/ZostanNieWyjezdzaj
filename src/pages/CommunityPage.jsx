import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, Check, Plus, ChevronLeft, ChevronRight, Loader2, User, X, MessageSquare, Send, ArrowLeft, ChevronDown, Navigation } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import mockEventsStatic from '../data/mockEvents'

const categories = ['wszystkie', 'sportowe', 'imprezy', 'warsztaty', 'kultura', 'lokalne']

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()
const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']

const getPolishGenitiveMonth = (monthIndex) => {
  const genitiveMonths = [
    'Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca',
    'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'
  ];
  return genitiveMonths[monthIndex] || '';
}

const parsePolishMonth = (monthStr) => {
  if (!monthStr) return null;
  const m = monthStr.toLowerCase();
  if (m.includes('styc') || m.includes('stysz')) return 0;
  if (m.includes('lut')) return 1;
  if (m.includes('marc') || m.includes('marz')) return 2;
  if (m.includes('kwie')) return 3;
  if (m.includes('maj')) return 4;
  if (m.includes('czerw')) return 5;
  if (m.includes('lip')) return 6;
  if (m.includes('sierp')) return 7;
  if (m.includes('wrzes')) return 8;
  if (m.includes('paźd') || m.includes('pazd')) return 9;
  if (m.includes('list')) return 10;
  if (m.includes('grud')) return 11;
  return null;
}

const getEventDateInfo = (ev, selectedYear) => {
  const dateStr = ev.event_date || ev.date;
  if (!dateStr) return { day: null, month: null, year: null, isRecurring: false };

  // 1. If it contains dashes (like YYYY-MM-DD)
  if (dateStr.includes('-')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return {
        day: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        isRecurring: false
      };
    }
  }

  // 2. If it is "Codziennie" or recurring like "Każda Sobota"
  const normalized = dateStr.toLowerCase().trim();
  if (normalized === 'codziennie') {
    return { day: null, month: null, year: null, isRecurring: true, recurringType: 'daily' };
  }
  if (normalized.startsWith('każdy') || normalized.startsWith('każda') || normalized.startsWith('kazdy') || normalized.startsWith('kazda')) {
    return { day: null, month: null, year: null, isRecurring: true, recurringType: 'weekly', dayOfWeek: ev.event_day };
  }

  // 3. If it is "15 Czerwca" or "5 Września"
  const parts = normalized.split(/\s+/);
  if (parts.length >= 2) {
    const dayNum = parseInt(parts[0]);
    const monthIdx = parsePolishMonth(parts[1]);
    if (!isNaN(dayNum) && monthIdx !== null) {
      return {
        day: dayNum,
        month: monthIdx,
        year: selectedYear,
        isRecurring: false
      };
    }
  }

  // Fallback: if there is just a number
  const num = parseInt(dateStr);
  if (!isNaN(num)) {
    return {
      day: num,
      month: null,
      year: null,
      isRecurring: false
    };
  }

  return { day: null, month: null, year: null, isRecurring: false };
}

const SIMULATED_TODAY = new Date('2026-06-16') // Default calendar showcase simulated date

const isEventPast = (ev) => {
  const info = getEventDateInfo(ev, 2026)
  if (info.isRecurring) return false
  if (info.day && info.month !== null && info.year) {
    const evDate = new Date(info.year, info.month, info.day)
    return evDate < SIMULATED_TODAY
  }
  return false
}

// Generate context-aware custom mock discussions for each separate activity to make chats completely unique
const getMockMessagesForEvent = (event) => {
  const isPast = isEventPast(event)
  if (!isPast) {
    return [
      { from: 'System', text: `Witamy w społeczności przyszłego wydarzenia: ${event.title}! Poniżej możecie dogadywać się co do wspólnego dojazdu czy szczegółów organizacyjnych.`, time: 'Teraz' }
    ]
  }

  const title = (event.title || '').toLowerCase()
  const category = (event.category || '').toLowerCase()

  if (title.includes('chleb') || title.includes('pieczeń') || title.includes('kgw') || title.includes('kulinarn')) {
    return [
      { from: 'Janusz z Tymbarku', text: 'Świetne warsztaty! Tradycyjny chleb wyszedł rewelacyjnie.', time: 'Wczoraj, 18:24' },
      { from: 'Kasia Nowak', text: 'Zgadzam się, przepis od KGW Tymbark jest genialny! Kiedy następne?', time: 'Wczoraj, 19:10' },
      { from: 'Marek Sołtys', text: 'Dziękuję wszystkim sąsiadom za tak liczny udział! Zostańmy w kontakcie na tym czacie.', time: 'Dziś, 09:15' },
    ]
  }

  if (title.includes('repair') || title.includes('napraw') || title.includes('cafe') || title.includes('eko') || title.includes('środowisk') || category.includes('ekologia')) {
    return [
      { from: 'Kasia Nowak', text: 'Super inicjatywa z tym Repair Cafe! Naprawiłam stary toster sąsiadki :)', time: 'Wczoraj, 16:40' },
      { from: 'Piotr K.', text: 'A ja pomogłem panu Staszkowi z rowerem. Bardzo fajna atmosfera.', time: 'Wczoraj, 17:15' },
      { from: 'Monika Zielińska', text: 'Następnym razem przyniosę maszynę do szycia, możemy porobić jakieś warsztaty!', time: 'Wczoraj, 20:02' },
    ]
  }

  if (category.includes('sport') || title.includes('bieg') || title.includes('mecz') || title.includes('turyst') || title.includes('joga') || category.includes('rekreacja')) {
    return [
      { from: 'Tomasz W.', text: 'Świetna trasa i super tempo! Wielkie dzięki dla organizatorów.', time: 'Wczoraj, 21:05' },
      { from: 'Aneta M.', text: 'Racja, pogoda dopisała, a zakwasy będą na pewno! Kiedy kolejny wspólny trening?', time: 'Dziś, 08:30' },
      { from: 'Janusz z Tymbarku', text: 'Ja chętnie dołączę w przyszły weekend, dajcie znać jaka trasa!', time: 'Dziś, 10:12' },
    ]
  }

  if (category.includes('edukacja') || title.includes('kodowan') || title.includes('warsztat') || title.includes('nauka') || title.includes('hack')) {
    return [
      { from: 'Marta B.', text: 'Dzieciaki były zachwycone tymi zajęciami, nie chciały wracać do domu!', time: 'Wczoraj, 18:50' },
      { from: 'Paweł K.', text: 'Moje też! Świetny poziom merytoryczny i super podejście prowadzących.', time: 'Wczoraj, 19:40' },
      { from: 'Kasia Nowak', text: 'Warto robić takie rzeczy lokalnie, brawa dla biblioteki za organizację.', time: 'Dziś, 09:20' },
    ]
  }

  return [
    { from: 'Janusz z Tymbarku', text: `Super wydarzenie: ${event.title}! Cieszę się, że mogłem wziąć udział.`, time: 'Wczoraj, 18:00' },
    { from: 'Kasia Nowak', text: 'Zgadzam się, organizacja była na najwyższym poziomie! Kiedy następne?', time: 'Wczoraj, 19:30' },
    { from: 'Marek Sołtys', text: 'Dziękuję wszystkim sąsiadom za tak liczny udział! Zostańmy w kontakcie.', time: 'Dziś, 08:15' },
  ]
}

function CommunityPage() {
  const { currentUser, joinEvent, leaveEvent, addPoints, isSupabaseActive } = useAuth()

  const [tab, setTab] = useState('events')
  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem('tymbark_events')
    if (stored) {
      try {
        const parsed = JSON.parse(stored).filter(e => e.type === 'event')
        const hasPast1 = parsed.some(e => e.id.toString() === 'past-1')
        const hasRepairCafe = parsed.some(e => e.id.toString() === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
        
        const staticPast1 = mockEventsStatic.find(e => e.id === 'past-1')
        const staticRepairCafe = mockEventsStatic.find(e => e.id === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
        
        const merged = [...parsed]
        if (!hasPast1 && staticPast1) merged.push(staticPast1)
        if (!hasRepairCafe && staticRepairCafe) {
          const updatedRepair = { ...staticRepairCafe, category: 'warsztaty' }
          merged.push(updatedRepair)
        }
        return merged
      } catch (e) {
        return mockEventsStatic.filter(e => e.type === 'event')
      }
    }
    return mockEventsStatic.filter(e => e.type === 'event').map(e => {
      if (e.id === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d') {
        return { ...e, category: 'warsztaty' }
      }
      return e
    })
  })
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('wszystkie')
  const [eventScope, setEventScope] = useState('all') // 'all' or 'joined'
  const [calMonth, setCalMonth] = useState(5) // Default to June 2026 (high event density for hackathon showcase!)
  const [calYear, setCalYear] = useState(2026)
  const [selectedDay, setSelectedDay] = useState(null)
  // 100% local frontend mock of joined events - past events (12th and 15th June) joined by default for demo!
  const [localJoinedIds, setLocalJoinedIds] = useState(['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'past-1'])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', category: 'lokalne', location: '', date: '', time: '', description: '' })

  // Groups state pre-populated with mock active neighbor chats
  const [groups, setGroups] = useState(() => {
    const stored = localStorage.getItem('tymbark_groups')
    const activeUserName = 'Ania'
    const defaultGroups = [
      {
        id: 'grp-past-1',
        eventId: 'past-1',
        name: 'Społeczność: Warsztaty Pieczenia Chleba KGW',
        members: ['Janusz z Tymbarku', 'Kasia Nowak', 'Marek Sołtys', activeUserName],
        messages: [
          { from: 'Janusz z Tymbarku', text: 'Świetne warsztaty! Tradycyjny chleb wyszedł rewelacyjnie.', time: 'Wczoraj, 18:24' },
          { from: 'Kasia Nowak', text: 'Zgadzam się, przepis od KGW Tymbark jest genialny! Kiedy następne?', time: 'Wczoraj, 19:10' },
          { from: 'Marek Sołtys', text: 'Dziękuję wszystkim sąsiadom za tak liczny udział! Zostańmy w kontakcie na tym czacie.', time: 'Dziś, 09:15' },
        ],
        createdAt: new Date().toISOString(),
        isPastCommunity: true
      },
      {
        id: 'grp-repair-cafe',
        eventId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        name: 'Społeczność: Sąsiedzkie Repair Cafe w remizie',
        members: ['Kasia Nowak', 'Piotr K.', 'Monika Zielińska', activeUserName],
        messages: [
          { from: 'Kasia Nowak', text: 'Super inicjatywa z tym Repair Cafe! Naprawiłam stary toster sąsiadki :)', time: 'Wczoraj, 16:40' },
          { from: 'Piotr K.', text: 'A ja pomogłem panu Staszkowi z rowerem. Bardzo fajna atmosfera.', time: 'Wczoraj, 17:15' },
          { from: 'Monika Zielińska', text: 'Następnym razem przyniosę maszynę do szycia, możemy porobić jakieś warsztaty!', time: 'Wczoraj, 20:02' },
        ],
        createdAt: new Date().toISOString(),
        isPastCommunity: true
      }
    ]
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed]
          defaultGroups.forEach(dg => {
            if (!merged.some(g => g.eventId === dg.eventId)) {
              merged.push(dg)
            }
          })
          return merged
        }
      } catch (e) {
        // Fallback
      }
    }
    return defaultGroups
  })
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [chatMessage, setChatMessage] = useState('')

  const tabs = [
    { id: 'events', label: 'Wydarzenia' },
    { id: 'groups', label: 'Grupy' },
  ]

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true)
      if (isSupabaseActive) {
        const { data, error } = await supabase.from('events').select('*').eq('type', 'event')
        if (error) throw error
        const merged = data || []
        const hasPast1 = merged.some(e => e.id.toString() === 'past-1')
        const hasRepairCafe = merged.some(e => e.id.toString() === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
        
        const staticPast1 = mockEventsStatic.find(e => e.id === 'past-1')
        const staticRepairCafe = mockEventsStatic.find(e => e.id === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
        
        if (!hasPast1 && staticPast1) merged.push(staticPast1)
        if (!hasRepairCafe && staticRepairCafe) {
          const updatedRepair = { ...staticRepairCafe, category: 'warsztaty' }
          merged.push(updatedRepair)
        }
        setEvents(merged)
      } else {
        const stored = localStorage.getItem('tymbark_events')
        if (stored) {
          try {
            const parsed = JSON.parse(stored).filter(e => e.type === 'event')
            const hasPast1 = parsed.some(e => e.id.toString() === 'past-1')
            const hasRepairCafe = parsed.some(e => e.id.toString() === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
            
            const staticPast1 = mockEventsStatic.find(e => e.id === 'past-1')
            const staticRepairCafe = mockEventsStatic.find(e => e.id === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
            
            let merged = [...parsed]
            let updated = false
            if (!hasPast1 && staticPast1) {
              merged.push(staticPast1)
              updated = true
            }
            if (!hasRepairCafe && staticRepairCafe) {
              const updatedRepair = { ...staticRepairCafe, category: 'warsztaty' }
              merged.push(updatedRepair)
              updated = true
            }
            if (updated) {
              localStorage.setItem('tymbark_events', JSON.stringify(merged))
            }
            setEvents(merged)
          } catch (e) {
            setEvents(mockEventsStatic.filter(e => e.type === 'event'))
          }
        } else {
          localStorage.setItem('tymbark_events', JSON.stringify(mockEventsStatic))
          setEvents(mockEventsStatic.filter(e => e.type === 'event'))
        }
      }
    } catch (err) {
      console.error('Błąd wczytywania wydarzeń:', err)
      setEvents(mockEventsStatic.filter(e => e.type === 'event'))
    } finally {
      setLoadingEvents(false)
    }
  }

  // Load groups from localStorage
  const loadGroups = () => {
    const stored = localStorage.getItem('tymbark_groups')
    if (stored) setGroups(JSON.parse(stored))
  }

  const saveGroups = (updated) => {
    setGroups(updated)
    localStorage.setItem('tymbark_groups', JSON.stringify(updated))
  }

  useEffect(() => { fetchEvents(); loadGroups() }, [currentUser])

  const toggleJoinEvent = (event) => {
    const idStr = event.id.toString()
    if (localJoinedIds.includes(idStr)) {
      setLocalJoinedIds(localJoinedIds.filter(id => id !== idStr))
    } else {
      setLocalJoinedIds([...localJoinedIds, idStr])
      if (addPoints) {
        addPoints(20) // dynamic points update for wallet feedback!
      }
      createGroupFromEvent(event) // Automatically ensure a separate, dedicated chat room is created!
    }
  }

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) return
    const created = {
      id: 'local-' + Date.now(),
      title: newEvent.title,
      category: newEvent.category,
      location_name: newEvent.location,
      event_date: newEvent.date,
      event_time: newEvent.time || '12:00',
      event_day: '',
      description: newEvent.description,
      attendees_count: 1,
      type: 'event',
      image_url: null,
      gmina: 'Tymbark',
      created_by: currentUser?.name || 'Anonim',
    }
    const stored = localStorage.getItem('tymbark_events')
    const all = stored ? JSON.parse(stored) : mockEventsStatic
    all.push(created)
    localStorage.setItem('tymbark_events', JSON.stringify(all))
    setEvents(all.filter(e => e.type === 'event'))
    setShowAddEvent(false)
    setNewEvent({ title: '', category: 'lokalne', location: '', date: '', time: '', description: '' })
  }

  const createGroupFromEvent = (event) => {
    const activeUserName = currentUser?.name || 'Ania'
    const existing = groups.find(g => g.eventId === event.id.toString())
    if (existing) return

    const isPast = isEventPast(event)
    const mockMembers = ['Janusz z Tymbarku', 'Kasia Nowak', 'Marek Sołtys', activeUserName]
    const mockMessages = getMockMessagesForEvent(event)

    const newGroup = {
      id: 'grp-' + Date.now(),
      eventId: event.id.toString(),
      name: `Społeczność: ${event.title}`,
      members: mockMembers,
      messages: mockMessages,
      createdAt: new Date().toISOString(),
      isPastCommunity: isPast
    }
    saveGroups([...groups, newGroup])
  }

  const joinGroup = (groupId) => {
    const activeUserName = currentUser?.name || 'Ania'
    const updated = groups.map(g => {
      if (g.id === groupId && !g.members.includes(activeUserName)) {
        return { ...g, members: [...g.members, activeUserName] }
      }
      return g
    })
    saveGroups(updated)
  }

  const sendGroupMessage = (groupId) => {
    if (!chatMessage.trim()) return
    const activeUserName = currentUser?.name || 'Ania'
    const userMsg = chatMessage.trim()
    
    // Add user's message
    const updated = groups.map(g => {
      if (g.id === groupId) {
        return { 
          ...g, 
          messages: [
            ...g.messages, 
            { 
              from: activeUserName, 
              text: userMsg, 
              time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' }) 
            }
          ] 
        }
      }
      return g
    })
    saveGroups(updated)
    setChatMessage('')

    // Trigger bot reply after 1.5s
    setTimeout(() => {
      const bots = ['Kasia Nowak', 'Janusz z Tymbarku', 'Marek Sołtys', 'Monika Zielińska']
      const botReplies = [
        "Świetnie powiedziane! Zgadzam się w stu procentach 👍",
        "Dokładnie! Musimy koniecznie zorganizować kolejne takie spotkanie w Tymbarku.",
        "Super pomysł! Też chętnie się w to zaangażuję następnym razem.",
        "Jasne! Dajcie znać, kiedy planujemy kolejne spotkanie, chętnie pomogę w organizacji.",
        "Fajnie, że tak prężnie działamy jako sąsiedzi! Pozdrowienia dla wszystkich 😊"
      ]
      
      const randomBot = bots[Math.floor(Math.random() * bots.length)]
      const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)]
      
      setGroups(prevGroups => {
        const updatedWithBot = prevGroups.map(g => {
          if (g.id === groupId) {
            return {
              ...g,
              messages: [
                ...g.messages,
                {
                  from: randomBot,
                  text: randomReply,
                  time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })
                }
              ]
            }
          }
          return g
        })
        localStorage.setItem('tymbark_groups', JSON.stringify(updatedWithBot))
        return updatedWithBot
      })
    }, 1500)
  }

  // Calendar data
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1

  // Helper to get if user is signed up for any event on a specific day
  const isUserParticipatingOnDay = (day) => {
    return events.some(ev => {
      const info = getEventDateInfo(ev, calYear)
      const isJoined = localJoinedIds.includes(ev.id.toString())
      if (!isJoined) return false

      if (info.isRecurring) {
        const dateObj = new Date(calYear, calMonth, day)
        const dayOfWeekIdx = dateObj.getDay()
        const dayNamesEn = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']
        const currentDayOfWeekName = dayNamesEn[dayOfWeekIdx]

        if (info.recurringType === 'daily') return true
        if (info.recurringType === 'weekly') {
          const eventDayOfWeek = (info.dayOfWeek || '').toLowerCase()
          return eventDayOfWeek === currentDayOfWeekName.toLowerCase() ||
                 (eventDayOfWeek === 'sobota' && dayOfWeekIdx === 6) ||
                 (eventDayOfWeek === 'niedziela' && dayOfWeekIdx === 0) ||
                 (eventDayOfWeek === 'czwartek' && dayOfWeekIdx === 4) ||
                 (eventDayOfWeek === 'piątek' && dayOfWeekIdx === 5) ||
                 (eventDayOfWeek === 'wtorek' && dayOfWeekIdx === 2) ||
                 (eventDayOfWeek === 'środa' && dayOfWeekIdx === 3) ||
                 (eventDayOfWeek === 'poniedziałek' && dayOfWeekIdx === 1)
        }
      } else {
        return info.day === day &&
               (info.month === null || info.month === calMonth) &&
               (info.year === null || info.year === calYear)
      }
      return false
    })
  }

  // Style for calendar days - keeps standard days transparent and only highlights selected, participating or event density days
  const getDayStyles = (dayNum, count, isSelected) => {
    if (isSelected) {
      return 'bg-forest text-white font-bold ring-2 ring-forest/30 shadow-md scale-105 z-10'
    }
    const isParticipating = isUserParticipatingOnDay(dayNum)
    if (isParticipating) {
      return 'bg-mint/20 text-forest font-bold border border-mint/40 hover:bg-mint/30 shadow-sm'
    }
    if (count > 0) {
      return 'bg-gray-200 text-graphite font-bold hover:bg-gray-300 border border-gray-300/40 shadow-sm'
    }
    return 'text-graphite hover:bg-soft-bg'
  }

  // Dynamic colors for the small event count badges (top-right circles)
  const getBadgeStyles = (count, isSelected) => {
    if (isSelected) {
      return 'bg-yellow-300 text-forest shadow-sm scale-110'
    }
    if (count === 1) {
      return 'bg-forest/15 text-forest font-bold'
    }
    if (count === 2) {
      return 'bg-forest/45 text-white font-bold'
    }
    if (count === 3) {
      return 'bg-forest text-white font-bold'
    }
    return 'bg-warm-orange text-white font-black shadow-sm shadow-warm-orange/10'
  }

  // Calculate event count for a specific day in selected year/month, respecting category, eventScope and including recurring
  const getEventCountForDay = (day, month, year) => {
    const dateObj = new Date(year, month, day)
    const dayOfWeekIdx = dateObj.getDay()
    const dayNamesEn = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']
    const currentDayOfWeekName = dayNamesEn[dayOfWeekIdx]

    return events.filter(ev => {
      // Scope Filter (All vs Joined)
      const isJoined = localJoinedIds.includes(ev.id.toString())
      if (eventScope === 'joined' && !isJoined) {
        return false
      }

      // Category Filter
      if (categoryFilter !== 'wszystkie' && (ev.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
        return false
      }

      const info = getEventDateInfo(ev, year)
      if (info.isRecurring) {
        if (info.recurringType === 'daily') return true
        if (info.recurringType === 'weekly') {
          const eventDayOfWeek = (info.dayOfWeek || '').toLowerCase()
          return eventDayOfWeek === currentDayOfWeekName.toLowerCase() ||
                 (eventDayOfWeek === 'sobota' && dayOfWeekIdx === 6) ||
                 (eventDayOfWeek === 'niedziela' && dayOfWeekIdx === 0) ||
                 (eventDayOfWeek === 'czwartek' && dayOfWeekIdx === 4) ||
                 (eventDayOfWeek === 'piątek' && dayOfWeekIdx === 5) ||
                 (eventDayOfWeek === 'wtorek' && dayOfWeekIdx === 2) ||
                 (eventDayOfWeek === 'środa' && dayOfWeekIdx === 3) ||
                 (eventDayOfWeek === 'poniedziałek' && dayOfWeekIdx === 1)
        }
      } else {
        return info.day === day &&
               (info.month === null || info.month === month) &&
               (info.year === null || info.year === year)
      }
      return false
    }).length
  }

  // Populate event counts for current calendar view
  const eventDays = {}
  for (let d = 1; d <= daysInMonth; d++) {
    const count = getEventCountForDay(d, calMonth, calYear)
    if (count > 0) {
      eventDays[d] = count
    }
  }

  // Filter events list by category, selected month, year, eventScope, and selectedDay (if active)
  const filteredEvents = events.filter(ev => {
    // 1. Scope Filter (All vs Joined)
    const isJoined = localJoinedIds.includes(ev.id.toString())
    if (eventScope === 'joined' && !isJoined) {
      return false
    }

    // 2. Category Filter
    if (categoryFilter !== 'wszystkie' && (ev.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
      return false
    }

    const info = getEventDateInfo(ev, calYear)

    // 3. Day-specific filter
    if (selectedDay !== null) {
      if (info.isRecurring) {
        const dateObj = new Date(calYear, calMonth, selectedDay)
        const dayOfWeekIdx = dateObj.getDay()
        const dayNamesEn = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']
        const currentDayOfWeekName = dayNamesEn[dayOfWeekIdx]

        if (info.recurringType === 'daily') return true
        if (info.recurringType === 'weekly') {
          const eventDayOfWeek = (info.dayOfWeek || '').toLowerCase()
          return eventDayOfWeek === currentDayOfWeekName.toLowerCase() ||
                 (eventDayOfWeek === 'sobota' && dayOfWeekIdx === 6) ||
                 (eventDayOfWeek === 'niedziela' && dayOfWeekIdx === 0) ||
                 (eventDayOfWeek === 'czwartek' && dayOfWeekIdx === 4) ||
                 (eventDayOfWeek === 'piątek' && dayOfWeekIdx === 5) ||
                 (eventDayOfWeek === 'wtorek' && dayOfWeekIdx === 2) ||
                 (eventDayOfWeek === 'środa' && dayOfWeekIdx === 3) ||
                 (eventDayOfWeek === 'poniedziałek' && dayOfWeekIdx === 1)
        }
      } else {
        return info.day === selectedDay &&
               (info.month === null || info.month === calMonth) &&
               (info.year === null || info.year === calYear)
      }
    } else {
      // 4. Month-wide filter
      if (info.isRecurring) {
        return true
      } else {
        return (info.month === null || info.month === calMonth) &&
               (info.year === null || info.year === calYear)
      }
    }
    return false
  })

  // Check if user participated in event (for group creation eligibility)
  const canCreateGroup = (event) => {
    return localJoinedIds.includes(event.id.toString())
  }

  const getGroupForEvent = (eventId) => {
    return groups.find(g => g.eventId === eventId.toString())
  }

  // ===== GROUP DETAIL VIEW =====
  if (selectedGroup) {
    const group = groups.find(g => g.id === selectedGroup)
    if (!group) { setSelectedGroup(null); return null }
    const activeUserName = currentUser?.name || 'Ania'
    const isMember = group.members.includes(activeUserName)

    return (
      <div className="px-4 flex flex-col h-full pb-28 pt-2">
        {/* Header */}
        <div className="flex items-center gap-3 py-2 mb-3">
          <button onClick={() => setSelectedGroup(null)} className="w-8 h-8 rounded-full bg-soft-bg flex items-center justify-center">
            <ArrowLeft size={16} className="text-graphite" />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-graphite leading-tight">{group.name}</h2>
            <p className="text-[10px] text-graphite-light">{group.members.length} członków</p>
          </div>
        </div>

        {/* Members */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
          {group.members.map((m, i) => (
            <div key={i} className="flex items-center gap-1 px-2 py-1 bg-forest/10 rounded-full flex-shrink-0">
              <div className="w-4 h-4 rounded-full bg-forest flex items-center justify-center">
                <span className="text-[7px] text-white font-bold">{m.charAt(0)}</span>
              </div>
              <span className="text-[9px] font-medium text-forest">{m}</span>
            </div>
          ))}
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-3 bg-soft-bg rounded-2xl p-3 border border-card-border">
          {group.messages.length === 0 ? (
            <p className="text-[11px] text-graphite-light text-center py-6">Brak wiadomości. Rozpocznij rozmowę!</p>
          ) : (
            group.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === activeUserName ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-[11px] ${
                  msg.from === activeUserName
                    ? 'bg-forest text-white rounded-br-md'
                    : 'bg-white text-graphite border border-card-border rounded-bl-md'
                }`}>
                  {msg.from !== activeUserName && (
                    <p className="text-[9px] font-bold text-forest mb-0.5">{msg.from}</p>
                  )}
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={`text-[8px] mt-0.5 ${msg.from === activeUserName ? 'text-white/60' : 'text-gray-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        {isMember ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendGroupMessage(group.id)}
              placeholder="Napisz wiadomość..."
              className="flex-1 px-3.5 py-2.5 bg-white rounded-xl text-[12px] outline-none border border-card-border focus:ring-2 focus:ring-forest/20"
            />
            <button onClick={() => sendGroupMessage(group.id)} className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center" aria-label="Wyślij">
              <Send size={14} className="text-white" />
            </button>
          </div>
        ) : (
          <button onClick={() => joinGroup(group.id)} className="w-full py-3 gradient-primary text-white rounded-xl text-[12px] font-semibold active:scale-[0.97] transition-transform">
            Dołącz do grupy
          </button>
        )}
      </div>
    )
  }

  // ===== MAIN RENDER =====
  return (
    <div className="px-4 space-y-4 flex-1 overflow-y-auto pb-28 pt-2">
      {/* Header */}
      <div className="py-1">
        <h1 className="text-lg font-bold text-graphite">Społeczność</h1>
        <p className="text-[11px] text-graphite-light">Tymbark i region Małopolski</p>
      </div>

      {/* Tabs: Wydarzenia / Grupy */}
      <div className="relative flex bg-white rounded-xl border border-card-border p-1 shadow-card">
        {/* Sliding background pill indicator */}
        <div
          className="absolute top-1 bottom-1 bg-forest rounded-lg shadow-sm transition-all duration-300 ease-out"
          style={{
            left: tab === 'events' ? '4px' : 'calc(50% + 2px)',
            width: 'calc(50% - 6px)'
          }}
        />
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative z-10 flex-1 py-2 rounded-lg text-[11px] font-semibold transition-colors duration-300 ${
              tab === t.id ? 'text-white font-bold' : 'text-graphite-light hover:text-graphite'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== TAB: WYDARZENIA ===== */}
      {tab === 'events' && (
        <div className="space-y-4">
          {/* Add event button */}
          <button
            onClick={() => setShowAddEvent(true)}
            className="w-full card-base p-3 flex items-center justify-center gap-2 border-2 border-dashed border-forest/20 bg-forest/5 hover:bg-forest/10 transition-colors"
          >
            <Plus size={16} className="text-forest" />
            <span className="text-[11px] font-semibold text-forest">Dodaj wydarzenie lokalne</span>
          </button>

          {/* Segmented Control Scope Switch */}
          <div className="relative flex bg-slate-100 rounded-xl p-1 border border-card-border shadow-inner">
            {/* Sliding background pill indicator */}
            <div
              className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out"
              style={{
                left: eventScope === 'all' ? '4px' : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)'
              }}
            />
            <button
              onClick={() => { setSelectedDay(null); setEventScope('all'); }}
              className={`relative z-10 flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors duration-300 ${
                eventScope === 'all' ? 'text-forest' : 'text-graphite-light hover:text-graphite'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => { setSelectedDay(null); setEventScope('joined'); }}
              className={`relative z-10 flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors duration-300 flex items-center justify-center gap-1.5 ${
                eventScope === 'joined' ? 'text-forest' : 'text-graphite-light hover:text-graphite'
              }`}
            >
              <Check size={11} className={eventScope === 'joined' ? 'text-forest' : 'text-graphite-light'} />
              Moje ({localJoinedIds.length})
            </button>
          </div>

          {/* Mini calendar */}
          <div className="card-base p-3">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => { setSelectedDay(null); if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }} className="w-6 h-6 rounded-full bg-soft-bg flex items-center justify-center" aria-label="Poprzedni miesiąc">
                <ChevronLeft size={12} className="text-graphite-light" />
              </button>
              <span className="text-[11px] font-bold text-graphite">{monthNames[calMonth]} {calYear}</span>
              <button onClick={() => { setSelectedDay(null); if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }} className="w-6 h-6 rounded-full bg-soft-bg flex items-center justify-center" aria-label="Następny miesiąc">
                <ChevronRight size={12} className="text-graphite-light" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => (
                <div key={d} className="text-center text-[8px] font-semibold text-graphite-light py-0.5">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: adjustedFirstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const count = eventDays[day]
                const isSelected = selectedDay === day
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`relative w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium transition-all ${getDayStyles(day, count, isSelected)}`}
                  >
                    {day}
                    {count > 0 && (
                      <span className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[7px] font-bold rounded-full flex items-center justify-center transition-all ${getBadgeStyles(count, isSelected)}`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category filter dropdown - ultra clean and space-saving */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white text-graphite font-bold px-4 py-3 rounded-xl border border-card-border shadow-sm appearance-none outline-none focus:ring-2 focus:ring-forest/20 text-[11px] pr-10 hover:border-forest/30 transition-all cursor-pointer active:scale-[0.99]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  Kategoria: {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-forest flex items-center">
              <ChevronDown size={14} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Calendar Active Filter Badge - optimized to prevent wrapping on mobile */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-card-border p-2.5 shadow-sm text-[10px] w-full">
            <span className="font-bold text-graphite flex items-center gap-1 flex-1 min-w-0">
              <Calendar size={12} className="text-forest flex-shrink-0" />
              <span className="truncate">
                {selectedDay !== null ? (
                  <>
                    Dzień: <span className="text-forest">{selectedDay} {getPolishGenitiveMonth(calMonth)}</span>
                  </>
                ) : (
                  <>
                    Miesiąc: <span className="text-forest">{monthNames[calMonth]}</span>
                  </>
                )}
              </span>
            </span>
            {selectedDay !== null && (
              <button
                onClick={() => setSelectedDay(null)}
                className="px-2 py-1 bg-forest/10 hover:bg-forest/15 text-forest rounded-lg text-[9px] font-bold transition-colors flex items-center gap-1 flex-shrink-0"
              >
                <X size={10} /> Cały miesiąc
              </button>
            )}
          </div>

          {/* Events list */}
          {loadingEvents ? (
            <div className="flex items-center justify-center py-6 gap-2">
              <Loader2 size={16} className="text-forest animate-spin" />
              <span className="text-xs text-graphite-light font-medium">Ładowanie...</span>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="space-y-2">
              {filteredEvents.map((event) => {
                const isJoined = localJoinedIds.includes(event.id.toString())
                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full card-base p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform ${isJoined ? 'bg-mint/15 border border-mint/30 shadow-inner-glow' : 'border border-transparent'
                      }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isJoined ? 'bg-forest text-white' : 'bg-soft-bg text-graphite border border-card-border'
                      }`}>
                      <span className="text-[8px] font-medium leading-none opacity-80 uppercase">{(event.event_day || '').slice(0, 3)}</span>
                      <span className="text-[11px] font-bold leading-tight mt-0.5">{(event.event_date || '').split(' ')[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {event.category && (
                        <span className="text-[8px] font-bold text-forest bg-forest/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">{event.category}</span>
                      )}
                      <h3 className="text-[12px] font-bold text-graphite leading-tight line-clamp-1 mt-0.5">{event.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-[9px] text-graphite-light">
                        <span className="flex items-center gap-0.5"><Clock size={8} />{event.event_time}</span>
                        <span className="flex items-center gap-0.5"><MapPin size={8} />{event.location_name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {isJoined && <span className="text-[8px] font-bold text-forest bg-mint-light/30 px-1.5 py-0.5 rounded-full">Zapisano</span>}
                      <span className="text-[9px] text-graphite-light flex items-center gap-0.5"><Users size={8} />{event.attendees_count}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="card-base py-8 text-center flex flex-col items-center justify-center gap-2 border-2 border-dashed border-card-border bg-transparent shadow-none">
              <Calendar size={24} className="text-gray-300" />
              <p className="text-[11px] text-graphite-light font-medium">Brak wydarzeń w tej kategorii</p>
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: GRUPY ===== */}
      {tab === 'groups' && (
        <div className="space-y-3">
          {groups.length === 0 ? (
            <div className="card-base py-10 text-center flex flex-col items-center gap-2">
              <MessageSquare size={28} className="text-gray-300" />
              <p className="text-[12px] text-graphite-light font-medium">Brak grup</p>
              <p className="text-[10px] text-graphite-light max-w-[200px]">Grupy tworzą się po uczestnictwie w wydarzeniu. Zapisz się na wydarzenie, a potem utwórz grupę!</p>
            </div>
          ) : (
            groups.map((group) => {
              const isMember = currentUser && group.members.includes(currentUser.name)
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className="w-full card-base p-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={16} className="text-forest" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[12px] font-bold text-graphite leading-tight line-clamp-1">{group.name}</h3>
                    <p className="text-[10px] text-graphite-light mt-0.5 flex items-center gap-1">
                      <Users size={9} /> {group.members.length} członków
                      {group.messages.length > 0 && <span className="ml-1">• {group.messages.length} wiadomości</span>}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {isMember ? (
                      <span className="text-[8px] font-bold text-forest bg-mint-light/30 px-1.5 py-0.5 rounded-full">Członek</span>
                    ) : (
                      <span className="text-[8px] font-bold text-graphite-light bg-soft-bg px-1.5 py-0.5 rounded-full">Dołącz</span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}

      {/* ===== EVENT DETAIL POPUP ===== */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative w-full max-w-md bg-white rounded-t-4xl overflow-hidden shadow-2xl animate-slide-up h-[45%] flex flex-col">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-3 right-3 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center z-10 shadow-sm active:scale-95"
              aria-label="Zamknij"
            >
              <X size={12} className="text-graphite" />
            </button>

            {selectedEvent.image_url && (
              <div className="relative h-36 flex-shrink-0">
                <img src={selectedEvent.image_url} alt={selectedEvent.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-5 pb-3 scrollbar-hide">
              <h3 className="text-base font-bold text-graphite pr-8 break-words leading-snug">{selectedEvent.title}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-graphite-light">
                <span className="flex items-center gap-1 whitespace-nowrap"><Calendar size={11} />{selectedEvent.event_date}</span>
                <span className="flex items-center gap-1 whitespace-nowrap"><Clock size={11} />{selectedEvent.event_time}</span>
                <span className="flex items-center gap-1 break-all"><MapPin size={11} className="flex-shrink-0" />{selectedEvent.location_name}</span>
              </div>
              {selectedEvent.description && (
                <p className="text-[12px] text-graphite-light mt-3 leading-relaxed break-words whitespace-pre-line">{selectedEvent.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3 text-[10px] text-graphite-light">
                <Users size={11} /> {selectedEvent.attendees_count} uczestników
              </div>
            </div>

            {/* Fixed footer action buttons */}
            <div className="p-5 pt-3 pb-24 border-t border-gray-100 bg-white flex-shrink-0">
              {(() => {
                const isJoined = canCreateGroup(selectedEvent)
                const existingGroup = getGroupForEvent(selectedEvent.id)
                const isPast = isEventPast(selectedEvent)

                if (isPast) {
                  return (
                    <div className="mt-4 space-y-2">
                      <div className="w-full py-2.5 bg-gray-100 rounded-xl text-[11px] text-gray-500 font-bold flex items-center justify-center gap-1.5 border border-gray-200">
                        <span>⌛ Wydarzenie archiwalne</span>
                        {isJoined && <span className="text-forest bg-forest/10 px-1.5 py-0.5 rounded-full text-[9px] ml-1.5">Brałeś udział</span>}
                      </div>

                      <button
                        onClick={() => {
                          const idStr = selectedEvent.id.toString()
                          if (!localJoinedIds.includes(idStr)) {
                            setLocalJoinedIds([...localJoinedIds, idStr])
                            if (addPoints) {
                              addPoints(20)
                            }
                          }
                          createGroupFromEvent(selectedEvent)
                          setSelectedEvent(null)
                          
                          // Wait briefly and open the newly created group chat
                          setTimeout(() => {
                            const group = getGroupForEvent(selectedEvent.id)
                            if (group) {
                              setSelectedGroup(group.id)
                              setTab('groups')
                            }
                          }, 100)
                        }}
                        className="w-full py-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 bg-forest text-white active:scale-[0.97] transition-all hover:bg-forest-mid shadow-md shadow-forest/15"
                      >
                        <MessageSquare size={14} /> Dołącz do społeczności czatu
                      </button>
                    </div>
                  )
                }

                return (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {selectedEvent.latitude && selectedEvent.longitude && (
                        <button
                          onClick={() => {
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedEvent.latitude},${selectedEvent.longitude}`, '_blank');
                          }}
                          className="flex-1 py-3 bg-soft-bg text-forest border border-card-border hover:bg-gray-100 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                        >
                          <Navigation size={14} /> Nawiguj
                        </button>
                      )}
                      <button
                        onClick={() => { toggleJoinEvent(selectedEvent); setSelectedEvent(null) }}
                        className={`py-3 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform ${selectedEvent.latitude && selectedEvent.longitude ? 'flex-1' : 'w-full'
                          } ${isJoined ? 'bg-soft-bg text-forest border border-card-border' : 'gradient-primary text-white'
                          }`}
                      >
                        {isJoined ? <><X size={14} /> Zrezygnuj</> : <><Check size={14} /> Zapisz się</>}
                      </button>
                    </div>

                    {/* Create/join group - only if participated */}
                    {isJoined && (
                      <button
                        onClick={() => { 
                          createGroupFromEvent(selectedEvent)
                          setSelectedEvent(null) 
                          setTimeout(() => {
                            const grp = getGroupForEvent(selectedEvent.id)
                            if (grp) {
                              setSelectedGroup(grp.id)
                              setTab('groups')
                            } else {
                              setTab('groups')
                            }
                          }, 50)
                        }}
                        className="w-full py-3 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 bg-forest/10 text-forest border border-forest/20 active:scale-[0.97] transition-transform"
                      >
                        <MessageSquare size={14} /> Otwórz czat społeczności
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD EVENT MODAL ===== */}
      {showAddEvent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddEvent(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-4xl shadow-2xl animate-slide-up h-[60%] flex flex-col overflow-hidden border-t border-card-border">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
              <h3 className="text-sm font-bold text-graphite">Nowe wydarzenie lokalne</h3>
              <button
                onClick={() => setShowAddEvent(false)}
                className="w-7 h-7 bg-soft-bg rounded-full flex items-center justify-center active:scale-95"
                aria-label="Zamknij"
              >
                <X size={12} className="text-graphite" />
              </button>
            </div>

            {/* Scrollable Form fields */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide">
              <div>
                <label className="text-[10px] font-semibold text-graphite-light uppercase tracking-wider">Nazwa wydarzenia</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="np. Mecz piłki nożnej"
                  className="w-full mt-1 px-3 py-2.5 bg-soft-bg rounded-xl text-[12px] outline-none border border-card-border focus:ring-2 focus:ring-forest/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-graphite-light uppercase tracking-wider">Data</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 bg-soft-bg rounded-xl text-[12px] outline-none border border-card-border focus:ring-2 focus:ring-forest/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-graphite-light uppercase tracking-wider">Godzina</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 bg-soft-bg rounded-xl text-[12px] outline-none border border-card-border focus:ring-2 focus:ring-forest/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-graphite-light uppercase tracking-wider">Miejsce</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="np. Boisko przy szkole"
                  className="w-full mt-1 px-3 py-2.5 bg-soft-bg rounded-xl text-[12px] outline-none border border-card-border focus:ring-2 focus:ring-forest/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-graphite-light uppercase tracking-wider">Kategoria</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 bg-soft-bg rounded-xl text-[12px] outline-none border border-card-border focus:ring-2 focus:ring-forest/20"
                >
                  <option value="lokalne">Lokalne</option>
                  <option value="sportowe">Sportowe</option>
                  <option value="imprezy">Imprezy</option>
                  <option value="warsztaty">Warsztaty</option>
                  <option value="kultura">Kultura</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-graphite-light uppercase tracking-wider">Opis (opcjonalnie)</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Krótki opis wydarzenia..."
                  rows={2}
                  className="w-full mt-1 px-3 py-2.5 bg-soft-bg rounded-xl text-[12px] outline-none border border-card-border focus:ring-2 focus:ring-forest/20 resize-none"
                />
              </div>
            </div>

            {/* Fixed footer action */}
            <div className="p-5 pt-3 pb-24 border-t border-gray-100 bg-white flex-shrink-0">
              <button
                onClick={handleAddEvent}
                disabled={!newEvent.title || !newEvent.date || !newEvent.location}
                className="w-full py-3 gradient-primary text-white rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus size={14} /> Dodaj wydarzenie
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityPage
