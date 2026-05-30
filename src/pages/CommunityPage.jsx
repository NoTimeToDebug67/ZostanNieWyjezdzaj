import React, { useState } from 'react'
import { ThumbsUp, Calendar, MapPin, Users, Clock, ArrowRight, Check, Plus, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

const upcomingEvents = [
  {
    id: 1,
    title: 'Jarmark Bożonarodzeniowy',
    date: '22 Gru',
    day: 'Niedziela',
    time: '10:00 – 18:00',
    location: 'Rynek w Tymbarku',
    attendees: 89,
    joined: false,
    image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=400&h=200&fit=crop',
  },
  {
    id: 2,
    title: 'Warsztaty garncarskie',
    date: '15 Gru',
    day: 'Sobota',
    time: '14:00 – 17:00',
    location: 'Świetlica wiejska',
    attendees: 12,
    joined: true,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=200&fit=crop',
  },
  {
    id: 3,
    title: 'Bieg charytatywny',
    date: '20 Gru',
    day: 'Piątek',
    time: '9:00',
    location: 'Park miejski',
    attendees: 45,
    joined: true,
    image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=200&fit=crop',
  },
  {
    id: 4,
    title: 'Sesja Rady Gminy',
    date: '18 Gru',
    day: 'Środa',
    time: '16:00',
    location: 'Urząd Gminy',
    attendees: 8,
    joined: false,
    image: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=200&fit=crop',
  },
]

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
  const [votedProjects, setVotedProjects] = useState([])
  const [budgetExpanded, setBudgetExpanded] = useState(false)
  const [expandedProject, setExpandedProject] = useState(null)
  const [calendarFilter, setCalendarFilter] = useState('all') // 'all' | 'mine'

  const handleVote = (projectId) => {
    if (!votedProjects.includes(projectId)) {
      setVotedProjects([...votedProjects, projectId])
    }
  }

  const filteredEvents = calendarFilter === 'mine'
    ? upcomingEvents.filter(e => e.joined)
    : upcomingEvents

  return (
    <div className="px-4 space-y-5 flex-1 overflow-y-auto pb-28 pt-2">
      {/* Header */}
      <div className="py-1">
        <h1 className="text-lg font-bold text-graphite">Społeczność</h1>
        <p className="text-[11px] text-graphite-light">Tymbark i okolice</p>
      </div>

      {/* Calendar / Events */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-graphite uppercase tracking-wider">Kalendarz</h2>
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

        <div className="space-y-2">
          {filteredEvents.map((event) => (
            <div key={event.id} className="card-base p-3 flex items-center gap-3">
              {/* Date block */}
              <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                event.joined ? 'bg-forest text-white' : 'bg-soft-bg text-graphite'
              }`}>
                <span className="text-[10px] font-medium leading-none opacity-70">{event.day.slice(0, 3)}</span>
                <span className="text-sm font-bold leading-tight">{event.date.split(' ')[0]}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[12px] font-semibold text-graphite leading-tight">{event.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-graphite-light">
                  <span className="flex items-center gap-0.5"><Clock size={8} />{event.time}</span>
                  <span className="flex items-center gap-0.5"><MapPin size={8} />{event.location}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end gap-1">
                {event.joined && (
                  <span className="text-[9px] font-bold text-forest bg-mint-light/30 px-1.5 py-0.5 rounded-full">Zapisano</span>
                )}
                <span className="text-[9px] text-graphite-light flex items-center gap-0.5">
                  <Users size={8} />{event.attendees}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Budget - collapsible panel */}
      <section>
        <button
          onClick={() => setBudgetExpanded(!budgetExpanded)}
          className="w-full flex items-center justify-between mb-2.5"
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
                    className="w-full p-3.5 text-left"
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
