import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, Check, Plus, ChevronLeft, ChevronRight, Loader2, User, X, MessageSquare, Send, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import mockEventsStatic from '../data/mockEvents'

const categories = ['wszystkie', 'sportowe', 'imprezy', 'warsztaty', 'kultura', 'lokalne']

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()
const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']

function CommunityPage() {
  const { currentUser, joinEvent, leaveEvent, isSupabaseActive } = useAuth()

  const [tab, setTab] = useState('events')
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('wszystkie')
  const [calMonth, setCalMonth] = useState(11)
  const [calYear, setCalYear] = useState(2026)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', category: 'lokalne', location: '', date: '', time: '', description: '' })

  // Groups state
  const [groups, setGroups] = useState([])
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
        setEvents(data || [])
      } else {
        const stored = localStorage.getItem('tymbark_events')
        if (stored) {
          setEvents(JSON.parse(stored).filter(e => e.type === 'event'))
        } else {
          localStorage.setItem('tymbark_events', JSON.stringify(mockEventsStatic))
          setEvents(mockEventsStatic.filter(e => e.type === 'event'))
        }
      }
    } catch (err) {
      console.error('Błąd wczytywania wydarzeń:', err)
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

  const toggleJoinEvent = async (event) => {
    if (!currentUser) { alert('Zaloguj się najpierw!'); return }
    const isJoined = currentUser.joinedEvents.some(e => e.id.toString() === event.id.toString())
    if (isJoined) { await leaveEvent(event.id) } else { await joinEvent(event) }
    await fetchEvents()
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
    if (!currentUser) return
    const existing = groups.find(g => g.eventId === event.id.toString())
    if (existing) return
    const newGroup = {
      id: 'grp-' + Date.now(),
      eventId: event.id.toString(),
      name: event.title,
      members: [currentUser.name],
      messages: [],
      createdAt: new Date().toISOString(),
    }
    saveGroups([...groups, newGroup])
  }

  const joinGroup = (groupId) => {
    if (!currentUser) return
    const updated = groups.map(g => {
      if (g.id === groupId && !g.members.includes(currentUser.name)) {
        return { ...g, members: [...g.members, currentUser.name] }
      }
      return g
    })
    saveGroups(updated)
  }

  const sendGroupMessage = (groupId) => {
    if (!chatMessage.trim() || !currentUser) return
    const updated = groups.map(g => {
      if (g.id === groupId) {
        return { ...g, messages: [...g.messages, { from: currentUser.name, text: chatMessage, time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' }) }] }
      }
      return g
    })
    saveGroups(updated)
    setChatMessage('')
  }

  // Calendar data
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1

  const eventDays = events.reduce((acc, ev) => {
    const dateStr = ev.event_date || ev.date
    if (!dateStr) return acc
    let day = null
    if (dateStr.includes('-')) {
      const d = new Date(dateStr)
      if (d.getMonth() === calMonth && d.getFullYear() === calYear) day = d.getDate()
    } else {
      const num = parseInt(dateStr)
      if (!isNaN(num)) day = num
    }
    if (day) acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})

  const filteredEvents = categoryFilter === 'wszystkie'
    ? events
    : events.filter(e => (e.category || '').toLowerCase() === categoryFilter)

  // Check if user participated in event (for group creation eligibility)
  const canCreateGroup = (event) => {
    return currentUser && currentUser.joinedEvents.some(e => e.id.toString() === event.id.toString())
  }

  const getGroupForEvent = (eventId) => {
    return groups.find(g => g.eventId === eventId.toString())
  }

  // ===== GROUP DETAIL VIEW =====
  if (selectedGroup) {
    const group = groups.find(g => g.id === selectedGroup)
    if (!group) { setSelectedGroup(null); return null }
    const isMember = currentUser && group.members.includes(currentUser.name)

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
              <div key={i} className={`flex ${msg.from === currentUser?.name ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-[11px] ${
                  msg.from === currentUser?.name
                    ? 'bg-forest text-white rounded-br-md'
                    : 'bg-white text-graphite border border-card-border rounded-bl-md'
                }`}>
                  {msg.from !== currentUser?.name && (
                    <p className="text-[9px] font-bold text-forest mb-0.5">{msg.from}</p>
                  )}
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={`text-[8px] mt-0.5 ${msg.from === currentUser?.name ? 'text-white/60' : 'text-gray-400'}`}>{msg.time}</p>
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
      <div className="flex bg-white rounded-xl border border-card-border p-1 shadow-card">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
              tab === t.id ? 'bg-forest text-white shadow-sm' : 'text-graphite-light hover:text-graphite'
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

          {/* Mini calendar */}
          <div className="card-base p-3">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }} className="w-6 h-6 rounded-full bg-soft-bg flex items-center justify-center" aria-label="Poprzedni miesiąc">
                <ChevronLeft size={12} className="text-graphite-light" />
              </button>
              <span className="text-[11px] font-bold text-graphite">{monthNames[calMonth]} {calYear}</span>
              <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }} className="w-6 h-6 rounded-full bg-soft-bg flex items-center justify-center" aria-label="Następny miesiąc">
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
                return (
                  <button key={day} className={`relative w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium transition-colors ${count ? 'bg-forest/10 text-forest font-bold' : 'text-graphite hover:bg-soft-bg'}`}>
                    {day}
                    {count && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-forest text-white text-[7px] font-bold rounded-full flex items-center justify-center">{count}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all border ${
                  categoryFilter === cat
                    ? 'bg-forest text-white border-forest'
                    : 'bg-white text-graphite-light border-card-border hover:border-forest/30'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
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
                const isJoined = currentUser && currentUser.joinedEvents.some(e => e.id.toString() === event.id.toString())
                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full card-base p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                  >
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                      isJoined ? 'bg-forest text-white' : 'bg-soft-bg text-graphite border border-card-border'
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
          <div className="relative w-full max-w-md bg-white rounded-t-3xl overflow-hidden shadow-2xl animate-slide-up">
            {selectedEvent.image_url && (
              <div className="relative h-36">
                <img src={selectedEvent.image_url} alt={selectedEvent.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <div className="p-5 relative">
              <button onClick={() => setSelectedEvent(null)} className="absolute top-3 right-3 w-7 h-7 bg-soft-bg rounded-full flex items-center justify-center" aria-label="Zamknij">
                <X size={12} className="text-graphite" />
              </button>

              <h3 className="text-base font-bold text-graphite pr-8">{selectedEvent.title}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-graphite-light">
                <span className="flex items-center gap-1"><Calendar size={11} />{selectedEvent.event_date}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{selectedEvent.event_time}</span>
                <span className="flex items-center gap-1"><MapPin size={11} />{selectedEvent.location_name}</span>
              </div>
              {selectedEvent.description && (
                <p className="text-[12px] text-graphite-light mt-3 leading-relaxed">{selectedEvent.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-[10px] text-graphite-light">
                <Users size={11} /> {selectedEvent.attendees_count} uczestników
              </div>

              {/* Action buttons */}
              {(() => {
                const isJoined = canCreateGroup(selectedEvent)
                const existingGroup = getGroupForEvent(selectedEvent.id)
                return (
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => { toggleJoinEvent(selectedEvent); setSelectedEvent(null) }}
                      className={`w-full py-3 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform ${
                        isJoined ? 'bg-soft-bg text-forest border border-card-border' : 'gradient-primary text-white'
                      }`}
                    >
                      {isJoined ? <><X size={14} /> Zrezygnuj</> : <><Check size={14} /> Zapisz się</>}
                    </button>

                    {/* Create/join group - only if participated */}
                    {isJoined && !existingGroup && (
                      <button
                        onClick={() => { createGroupFromEvent(selectedEvent); setSelectedEvent(null); setTab('groups') }}
                        className="w-full py-3 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 bg-forest/10 text-forest border border-forest/20 active:scale-[0.97] transition-transform"
                      >
                        <MessageSquare size={14} /> Utwórz grupę z tego wydarzenia
                      </button>
                    )}
                    {isJoined && existingGroup && (
                      <button
                        onClick={() => { setSelectedEvent(null); setSelectedGroup(existingGroup.id); setTab('groups') }}
                        className="w-full py-3 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 bg-forest/10 text-forest border border-forest/20 active:scale-[0.97] transition-transform"
                      >
                        <MessageSquare size={14} /> Otwórz grupę ({existingGroup.members.length} osób)
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
          <div className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-7 shadow-2xl animate-slide-up">
            <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h3 className="text-sm font-bold text-graphite mb-4">Nowe wydarzenie lokalne</h3>

            <div className="space-y-3">
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

            <button
              onClick={handleAddEvent}
              disabled={!newEvent.title || !newEvent.date || !newEvent.location}
              className="w-full mt-4 py-3 gradient-primary text-white rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-40 disabled:pointer-events-none"
            >
              <Plus size={14} /> Dodaj wydarzenie
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityPage
