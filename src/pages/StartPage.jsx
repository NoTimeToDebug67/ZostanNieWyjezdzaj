import React, { useState, useRef } from 'react'
import { User, Clock, ArrowRight, Mic, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import AIOrb from '../components/AIOrb'

const cityAnnouncements = [
  {
    id: 1,
    title: 'Zmiana godzin pracy urzędu',
    body: 'Od 1 grudnia urząd gminy czynny w poniedziałki do 18:00. Pozostałe dni bez zmian.',
    urgent: true,
  },
  {
    id: 2,
    title: 'Odbiór odpadów wielkogabarytowych',
    body: 'Zbiórka 15 grudnia. Odpady wystawiamy do godz. 6:00 przed posesję.',
    urgent: false,
  },
  {
    id: 3,
    title: 'Przerwa w dostawie wody',
    body: '10 grudnia, godz. 8:00–14:00, ul. Kościelna i Zamieście. Przepraszamy za utrudnienia.',
    urgent: true,
  },
]

const mockNews = [
  {
    id: 1,
    title: 'Remont drogi powiatowej',
    summary: 'Prace na odcinku Tymbark–Podłopień potrwają do końca miesiąca.',
    time: '2 godz.',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=250&fit=crop',
  },
  {
    id: 2,
    title: 'Nowy plac zabaw otwarty',
    summary: 'Nowoczesny plac zabaw w Podłopieniu czeka na najmłodszych.',
    time: '5 godz.',
    image: 'https://images.unsplash.com/photo-1596997000103-e597b3ca50df?w=400&h=250&fit=crop',
  },
  {
    id: 3,
    title: 'Zbiórka darów w remizie',
    summary: 'KGW organizuje zbiórkę karmy i koców dla schroniska.',
    time: '1 dzień',
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=250&fit=crop',
  },
]

function StartPage({ onNavigate }) {
  const [chatOpen, setChatOpen] = useState(false)
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const sliderRef = useRef(null)

  const nextAnnouncement = () => {
    setAnnouncementIndex((i) => (i + 1) % cityAnnouncements.length)
  }
  const prevAnnouncement = () => {
    setAnnouncementIndex((i) => (i - 1 + cityAnnouncements.length) % cityAnnouncements.length)
  }

  const current = cityAnnouncements[announcementIndex]

  return (
    <div className="px-4 space-y-4">
      {/* Top bar - compact, phone-like */}
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-[11px] text-graphite-light">Dzień dobry</p>
          <h1 className="text-lg font-bold text-graphite leading-tight">Aniu 👋</h1>
        </div>
        <button
          onClick={() => onNavigate('profile')}
          className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center"
          aria-label="Profil"
        >
          <User size={16} className="text-forest" />
        </button>
      </div>

      {/* City announcement slider */}
      <div className="relative">
        <div className="bg-white rounded-2xl border border-card-border p-4 shadow-card">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              {current.urgent && (
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse-soft flex-shrink-0" />
              )}
              <span className="text-[10px] font-bold text-forest uppercase tracking-wider">Komunikat gminy</span>
            </div>
            <span className="text-[10px] text-graphite-light">{announcementIndex + 1}/{cityAnnouncements.length}</span>
          </div>
          <h3 className="text-sm font-bold text-graphite mb-1">{current.title}</h3>
          <p className="text-xs text-graphite-light leading-relaxed">{current.body}</p>

          {/* Navigation dots + arrows */}
          <div className="flex items-center justify-between mt-3">
            <button onClick={prevAnnouncement} className="w-7 h-7 rounded-full bg-soft-bg flex items-center justify-center" aria-label="Poprzedni">
              <ChevronLeft size={14} className="text-graphite-light" />
            </button>
            <div className="flex gap-1.5">
              {cityAnnouncements.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === announcementIndex ? 'w-4 bg-forest' : 'w-1.5 bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <button onClick={nextAnnouncement} className="w-7 h-7 rounded-full bg-soft-bg flex items-center justify-center" aria-label="Następny">
              <ChevronRight size={14} className="text-graphite-light" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Orb */}
      <AIOrb
        message="W Twoim sołectwie: remont drogi do Podłopienia i zbiórka darów w remizie OSP. Chcesz wiedzieć więcej?"
        onTap={() => setChatOpen(true)}
      />

      {/* News */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-graphite">Co nowego</h2>
          <button className="text-[11px] text-forest font-semibold flex items-center gap-0.5">
            Więcej <ArrowRight size={10} />
          </button>
        </div>

        {/* Featured */}
        <div className="card-base overflow-hidden mb-2.5">
          <div className="relative h-36">
            <img src={mockNews[0].image} alt={mockNews[0].title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3.5">
              <h3 className="text-white font-semibold text-[13px] leading-tight">{mockNews[0].title}</h3>
              <p className="text-white/70 text-[11px] mt-0.5">{mockNews[0].summary}</p>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {mockNews.slice(1).map((news) => (
            <div key={news.id} className="card-base p-2.5 flex items-center gap-3">
              <img src={news.image} alt={news.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-[12px] font-semibold text-graphite leading-tight">{news.title}</h4>
                <p className="text-[11px] text-graphite-light line-clamp-1 mt-0.5">{news.summary}</p>
                <span className="text-[9px] text-gray-400 flex items-center gap-0.5 mt-1">
                  <Clock size={8} /> {news.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setChatOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-7 shadow-2xl animate-slide-up">
            <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center animate-breathe">
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 bg-mint-light rounded-full" />
                  <div className="w-1 h-1 bg-mint-light rounded-full" />
                </div>
              </div>
              <span className="text-sm font-semibold text-graphite">Asystent Tymbark</span>
            </div>
            <div className="bg-soft-bg rounded-2xl p-3.5 mb-4">
              <p className="text-[13px] text-graphite leading-relaxed">
                Hej! Mogę pomóc znaleźć informacje, zgłosić usterkę głosem, albo odpowiedzieć na pytania o gminie.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center" aria-label="Nagraj głos">
                <Mic size={16} className="text-forest" />
              </button>
              <input
                type="text"
                placeholder="Napisz..."
                className="flex-1 px-3.5 py-2 bg-soft-bg rounded-xl text-sm outline-none focus:ring-2 focus:ring-forest/20 border border-card-border"
              />
              <button className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center" aria-label="Wyślij">
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StartPage
