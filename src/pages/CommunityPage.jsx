import React, { useState, useEffect } from 'react'
import { ThumbsUp, Calendar, MapPin, Users, Clock, ArrowRight, Check, Plus, ChevronDown, ChevronUp, MessageSquare, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import mockEventsStatic from '../data/mockEvents'

const budgetProjects = [
  {
    id: 1,
    title: 'Oświetlenie ścieżki rowerowej',
    author: 'Jan Kowalski',
    votes: 142,
    goal: 200,
    description: 'Montaż lamp solarnych wzdłuż ścieżki rowerowej od szkoły do parku.',
    hasGroup: true,
    groupMembers: 23,
  },
  {
    id: 2,
    title: 'Boisko wielofunkcyjne',
    author: 'OSP Tymbark',
    votes: 89,
    goal: 150,
    description: 'Budowa boiska do siatkówki i koszykówki przy świetlicy.',
    hasGroup: true,
    groupMembers: 15,
  },
  {
    id: 3,
    title: 'Ławki i kosze na rynku',
    author: 'Rada Sołecka',
    votes: 178,
    goal: 200,
    description: 'Wymiana starych ławek i dodanie koszy na śmieci segregowane.',
    hasGroup: false,
    groupMembers: 0,
  },
]

function CommunityPage() {
  const { currentUser, joinEvent, leaveEvent, isSupabaseActive } = useAuth();

  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [votedProjects, setVotedProjects] = useState([])
  const [budgetExpanded, setBudgetExpanded] = useState(false)
  const [expandedProject, setExpandedProject] = useState(null)
  const [calendarFilter, setCalendarFilter] = useState('all') // 'all' | 'mine'

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      if (isSupabaseActive) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('type', 'event');
        if (error) throw error;
        setEvents(data || []);
      } else {
        const stored = localStorage.getItem('tymbark_events');
        if (stored) {
          const parsed = JSON.parse(stored);
          setEvents(parsed.filter(e => e.type === 'event'));
        } else {
          localStorage.setItem('tymbark_events', JSON.stringify(mockEventsStatic));
          setEvents(mockEventsStatic.filter(e => e.type === 'event'));
        }
      }
    } catch (err) {
      console.error('Błąd wczytywania wydarzeń:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentUser]); // Refresh when registration state/session updates

  const toggleJoinEvent = async (event) => {
    if (!currentUser) {
      alert('Zaloguj się najpierw, aby zapisać się na wydarzenie!');
      return;
    }
    const isJoined = currentUser.joinedEvents.some(e => e.id.toString() === event.id.toString());
    if (isJoined) {
      await leaveEvent(event.id);
    } else {
      await joinEvent(event);
    }
    await fetchEvents();
  };

  const handleVote = (projectId) => {
    if (!votedProjects.includes(projectId)) {
      setVotedProjects([...votedProjects, projectId])
    }
  }

  const filteredEvents = calendarFilter === 'mine'
    ? events.filter(e => currentUser && currentUser.joinedEvents.some(je => je.id.toString() === e.id.toString()))
    : events;

  return (
    <div className="px-4 space-y-5 flex-1 overflow-y-auto pb-28 pt-2">
      {/* Header */}
      <div className="py-1">
        <h1 className="text-lg font-bold text-graphite">Społeczność</h1>
        <p className="text-[11px] text-graphite-light">Tymbark i region Małopolski</p>
      </div>

      {/* Calendar / Events */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-graphite uppercase tracking-wider">Kalendarz wydarzeń</h2>
          <div className="flex bg-soft-bg rounded-lg p-0.5">
            <button
              onClick={() => setCalendarFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                calendarFilter === 'all' ? 'bg-white text-forest shadow-sm' : 'text-graphite-light'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setCalendarFilter('mine')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                calendarFilter === 'mine' ? 'bg-white text-forest shadow-sm' : 'text-graphite-light'
              }`}
            >
              Moje
            </button>
          </div>
        </div>

        {loadingEvents ? (
          <div className="flex items-center justify-center py-6 gap-2">
            <Loader2 size={16} className="text-forest animate-spin" />
            <span className="text-xs text-graphite-light font-medium">Ładowanie wydarzeń...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const isJoined = currentUser && currentUser.joinedEvents.some(e => e.id.toString() === event.id.toString());
                return (
                  <div key={event.id} className="card-base p-3 flex items-center gap-3">
                    {/* Date block */}
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                      isJoined ? 'bg-forest text-white shadow-sm' : 'bg-soft-bg text-graphite border border-card-border'
                    }`}>
                      <span className="text-[9px] font-medium leading-none opacity-80 uppercase">{event.event_day.slice(0, 3)}</span>
                      <span className="text-xs font-bold leading-tight mt-0.5">{event.event_date.split(' ')[0]}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[8px] font-bold text-forest bg-forest/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          {event.category}
                        </span>
                        <span className="text-[8px] font-semibold text-graphite-light uppercase">
                          Gmina {event.gmina}
                        </span>
                      </div>
                      <h3 className="text-[12px] font-bold text-graphite leading-tight line-clamp-1">{event.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-graphite-light">
                        <span className="flex items-center gap-0.5"><Clock size={9} />{event.event_time}</span>
                        <span className="flex items-center gap-0.5"><MapPin size={9} className="flex-shrink-0" />{event.location_name}</span>
                      </div>
                    </div>

                    {/* Status & Join Action */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-[9px] text-graphite-light flex items-center gap-0.5 font-medium">
                        <Users size={9} />{event.attendees_count} {(() => { const n = event.attendees_count; const mod10 = n % 10; const mod100 = n % 100; if (n === 1) return 'osoba'; if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'osoby'; return 'osób'; })()}
                      </span>
                      <button
                        onClick={() => toggleJoinEvent(event)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${
                          isJoined
                            ? 'bg-forest/10 text-forest hover:bg-forest/20'
                            : 'gradient-primary text-white hover:opacity-95 active:scale-95'
                        }`}
                      >
                        {isJoined ? 'Zrezygnuj' : 'Zapisz się'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card-base py-8 text-center flex flex-col items-center justify-center gap-2 border-2 border-dashed border-card-border bg-transparent shadow-none">
                <Calendar size={24} className="text-gray-300 animate-float" />
                <p className="text-[11px] text-graphite-light font-medium">Brak zaplanowanych wydarzeń</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Budget - collapsible panel */}
      <section>
        <button
          onClick={() => setBudgetExpanded(!budgetExpanded)}
          className="w-full flex items-center justify-between mb-2.5 text-left"
        >
          <h2 className="text-xs font-bold text-graphite uppercase tracking-wider">Budżet obywatelski</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-forest font-semibold">
            <span>{budgetProjects.length} projekty</span>
            {budgetExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {budgetExpanded && (
          <div className="space-y-2.5 animate-slide-up">
            {budgetProjects.map((project) => {
              const progress = Math.round((project.votes / project.goal) * 100)
              const hasVoted = votedProjects.includes(project.id)
              const isExpanded = expandedProject === project.id

              return (
                <div key={project.id} className="card-base overflow-hidden">
                  <button
                    onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                    className="w-full p-3.5 text-left outline-none"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[12px] font-semibold text-graphite">{project.title}</h3>
                      <span className="text-[10px] text-graphite-light">{project.votes}/{project.goal}</span>
                    </div>
                    {/* Progress */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-forest to-mint rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-0 space-y-3 border-t border-card-border mt-1 pt-3">
                      <p className="text-[11px] text-graphite-light leading-relaxed">{project.description}</p>
                      <p className="text-[10px] text-graphite-light">Autor: {project.author}</p>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleVote(project.id); }}
                          disabled={hasVoted}
                          className={`flex-1 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            hasVoted
                              ? 'bg-mint-light/20 text-forest'
                              : 'bg-forest text-white active:scale-[0.97]'
                          }`}
                        >
                          {hasVoted ? <Check size={12} /> : <ThumbsUp size={12} />}
                          {hasVoted ? 'Zagłosowano' : 'Głosuj'}
                        </button>

                        {/* Group button */}
                        <button className="flex-1 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 bg-soft-bg text-forest border border-card-border active:scale-[0.97] transition-transform">
                          {project.hasGroup ? (
                            <>
                              <MessageSquare size={12} />
                              Grupa ({project.groupMembers})
                            </>
                          ) : (
                            <>
                              <Plus size={12} />
                              Utwórz grupę
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!budgetExpanded && (
          <div className="card-base p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-graphite-light">Najaktywniejszy projekt:</p>
                <p className="text-[12px] font-semibold text-graphite">{budgetProjects[2].title}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-forest">{Math.round((budgetProjects[2].votes / budgetProjects[2].goal) * 100)}%</span>
                <p className="text-[9px] text-graphite-light">głosów</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Local groups teaser */}
      <section>
        <h2 className="text-xs font-bold text-graphite uppercase tracking-wider mb-2.5">Grupy lokalne</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          {[
            { name: 'Boisko – gramy!', members: 15, emoji: '⚽' },
            { name: 'Ścieżka rowerowa', members: 23, emoji: '🚴' },
            { name: 'Ogródki działkowe', members: 8, emoji: '🌻' },
          ].map((group, i) => (
            <div key={i} className="card-base p-3 min-w-[140px] flex-shrink-0">
              <span className="text-xl">{group.emoji}</span>
              <h4 className="text-[11px] font-semibold text-graphite mt-1.5 leading-tight">{group.name}</h4>
              <p className="text-[9px] text-graphite-light mt-0.5 flex items-center gap-0.5">
                <Users size={8} /> {group.members} osób
              </p>
            </div>
          ))}
          {/* Create new group */}
          <button className="card-base p-3 min-w-[100px] flex-shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-card-border bg-transparent shadow-none">
            <Plus size={18} className="text-forest/40" />
            <span className="text-[9px] text-graphite-light mt-1 font-medium">Nowa grupa</span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default CommunityPage
