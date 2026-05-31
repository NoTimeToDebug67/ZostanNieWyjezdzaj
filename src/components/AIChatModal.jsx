import React, { useState, useEffect, useRef } from 'react'
import { X, Send, Sparkles, Loader2, MessageSquare, Bot, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import mockEventsStatic from '../data/mockEvents'

// System instruction generator that compiles active user context & current events list
const generateSystemPrompt = (user, activeEvents) => {
  const userName = user?.name || 'Mieszkaniec'
  const userPoints = user?.points || 340
  const userVillage = user?.village || 'Tymbark'

  // Format events list for LLM context
  const eventsListText = activeEvents.length > 0 
    ? activeEvents.map(e => `- 📅 ${e.title} | ${e.event_date || e.date || 'Wkrótce'} | Miejsce: ${e.location_name || 'Tymbark'} | Kategoria: ${e.category || 'Ogólne'}`).join('\n')
    : '- Brak aktywnych wydarzeń sąsiedzkich w bazie danych.'

  return `Jesteś Tymbark AI, inteligentnym i pełnym entuzjazmu lokalnym asystentem dla mieszkańców gminy Tymbark i okolic (Piekiełko, Podłopień, Zawadka). Działasz w aplikacji społecznościowej "Zostań - Nie Wyjeżdżaj!", której celem jest aktywizowanie mieszkańców, promowanie lokalnych wydarzeń, zgłaszanie usterek oraz nagradzanie zaangażowania.

Twój rozmówca to zalogowany użytkownik:
- Imię: ${userName}
- Pochodzi z miejscowości: ${userVillage}
- Stan portfela punktów: ${userPoints} pkt

Jak użytkownik może zdobyć punkty:
- Zapisanie się i udział w wydarzeniu sąsiedzkim: +20 pkt
- Zgłoszenie usterki (czerwony przycisk „Zgłoś” na dole ekranu): +10 pkt
- Głosowanie w lokalnych inicjatywach: +5 pkt

Dostępne nagrody w gminie Tymbark za punkty:
1. 🥐 Piekarnia u Kasi: Rabat -15% na wypieki (koszt: 100 pkt)
2. 🍽️ Restauracja Pod Lipą: Rabat -10% na obiady (koszt: 150 pkt)
3. 🌱 Sklep Ogrodniczy: Rabat -20% na nasiona (koszt: 200 pkt)

Baza aktualnych wydarzeń w gminie Tymbark z kalendarza:
${eventsListText}

Archiwalne wydarzenia sąsiedzkie (użytkownik może wciąż dołączyć do ich dedykowanego czatu grupowego w zakładce Społeczność):
- 🌾 Warsztaty Pieczenia Chleba KGW (12 Czerwca) w Świetlicy w Piekiełku.
- ☕ Sąsiedzkie Repair Cafe (15 Czerwca) w Remizie OSP Tymbark.

ZASADY ODPOWIADANIA:
1. Pisz zawsze po polsku, miło, życzliwie i z lokalną dumą (gmina Tymbark, Beskid Wyspowy!).
2. Gdy pytają o wydarzenia, polecaj wydarzenia z naszej bazy oraz zachęcaj do dołączania do archiwalnych czatów grupowych, by porozmawiać z sąsiadami.
3. Gdy pytają o punkty/nagrody, odnieś się do ich aktualnego portfela (${userPoints} pkt). Policz ile punktów brakuje do wybranej nagrody (np. do pieczywa u Kasi brakuje X pkt).
4. Gdy pytają jak pomóc, polecaj zgłaszanie usterek przez przycisk "+" na dole ekranu i czerwoną opcję "Zgłoś" (np. dziury w drogach, zepsute latarnie, dzikie wysypiska).
5. Formatuj tekst przejrzyście, stosując nagłówki, pogrubienia (**bold**), listy wypunktowane i emoji (np. 🌲, 🏆, 🥐, 🛠️, ❤️).
6. Odpowiedzi muszą być zwięzłe i krótkie, dopasowane do wygodnego czytania na ekranie smartfona.
7. Nie zmyślaj żadnych zewnętrznych faktów, wydarzeń ani cen nagród, które nie są podane w tym opisie systemowym.`
}

function AIChatModal({ isOpen, onClose }) {
  const { currentUser } = useAuth()
  const chatEndRef = useRef(null)

  // Read environment variable
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
  const isKeyConfigured = !!(GROQ_API_KEY && GROQ_API_KEY.trim() && GROQ_API_KEY !== 'YOUR_GROQ_API_KEY')

  // UI States
  const [usingLiveAPI, setUsingLiveAPI] = useState(isKeyConfigured)
  const [showKeyWarning, setShowKeyWarning] = useState(!isKeyConfigured)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [events, setEvents] = useState([])

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      from: 'bot',
      text: `Cześć ${currentUser?.name || 'Mieszkańcu'}! Jestem Twoim lokalnym Asystentem Tymbark AI. 🌲\n\nChętnie pomogę Ci sprawdzić nadchodzące wydarzenia sąsiedzkie, stan Twojego portfela punktów czy sposoby na zaangażowanie się w życie gminy. O co chciałbyś zapytać?`,
      time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })
    }
  ])

  // Load events from LocalStorage or mock database
  useEffect(() => {
    const stored = localStorage.getItem('tymbark_events')
    if (stored) {
      try {
        setEvents(JSON.parse(stored).filter(e => e.type === 'event'))
      } catch (e) {
        setEvents(mockEventsStatic.filter(e => e.type === 'event'))
      }
    } else {
      setEvents(mockEventsStatic.filter(e => e.type === 'event'))
    }
  }, [isOpen])

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (!isOpen) return null

  // Quick suggestions
  const suggestions = [
    { text: 'Co ciekawego dzieje się w okolicy?', id: 'events' },
    { text: 'Ile mam punktów i na co je wymienić?', id: 'points' },
    { text: 'Jak mogę zaangażować się społecznie?', id: 'help' }
  ]

  // Clean raw dates for display in local engine
  const formatEventDate = (ev) => {
    return ev.event_date || ev.date || 'Wkrótce'
  }

  // Local answer matching engine (used as offline fallback)
  const getAIResponse = (userText) => {
    const text = userText.toLowerCase().trim()
    const userName = currentUser?.name || 'Mieszkaniec'
    const userPoints = currentUser?.points || 340
    const userVillage = currentUser?.village || 'Tymbark'

    // 1. Check points/rewards questions
    if (text.includes('punkt') || text.includes('portfel') || text.includes('nagrod') || text.includes('piekarn') || text.includes('wymien')) {
      const remaining = Math.max(0, 500 - userPoints)
      return `Obecnie masz **${userPoints} punktów** w swoim portfelu mieszkańca! 🏆\n\nDo odebrania kolejnej nagrody brakuje Ci już tylko **${remaining} punktów**.\n\n**Dostępne nagrody w Tymbarku:**\n• 🥐 **Piekarnia u Kasi**: Rabat -15% na wypieki (koszt: 100 pkt)\n• 🍽️ **Restauracja Pod Lipą**: Rabat -10% na obiady (koszt: 150 pkt)\n• 🌱 **Sklep Ogrodniczy**: Rabat -20% na nasiona (koszt: 200 pkt)\n\n**Jak zdobyć więcej punktów?**\n• Zapisz się na wydarzenie sąsiedzkie: **+20 pkt**\n• Zgłoś usterkę przez czerwony przycisk „Zgłoś”: **+10 pkt**\n• Oddaj głos w sąsiedzkiej inicjatywie: **+5 pkt**`
    }

    // 2. Check events questions
    if (text.includes('wydarzen') || text.includes('imprez') || text.includes('dzieje') || text.includes('kalendarz') || text.includes('aktyw') || text.includes('warsztat') || text.includes('chleb') || text.includes('cafe')) {
      const tymbarkEvents = events.filter(e => e.gmina?.toLowerCase() === 'tymbark' || e.gmina?.toLowerCase() === 'piekiełko')
      const upcoming = tymbarkEvents.filter(e => {
        const dStr = (e.event_date || '').toLowerCase()
        return !dStr.includes('12') && !dStr.includes('14') && !dStr.includes('15')
      }).slice(0, 3)

      let resp = `W okolicy gminy **${userVillage}** i okolicach dzieje się mnóstwo ciekawych rzeczy! 🌲\n\n`
      
      resp += `**Niedawne wydarzenia (Archiwalne - możesz dołączyć do ich czatu):**\n`
      resp += `• 🌾 **Warsztaty Pieczenia Chleba KGW** (12 Czerwca) w Świetlicy w Piekiełku.\n`
      resp += `• ☕ **Sąsiedzkie Repair Cafe** (15 Czerwca) w Remizie OSP Tymbark.\n\n`

      resp += `**Nadchodzące wydarzenia lokalne:**\n`
      if (upcoming.length > 0) {
        upcoming.forEach(ev => {
          resp += `• 📅 **${ev.title}** – ${formatEventDate(ev)} o ${ev.event_time || '12:00'} (${ev.location_name || 'Tymbark'}). Zapisz się, by zyskać **+20 pkt** i otworzyć czat grupowy!\n`
        })
      } else {
        resp += `• 📅 **Gra Terenowa: Tajemnice Tymbarku** – 20 Czerwca o 10:00 (Biblioteka Publiczna Tymbark).\n`
        resp += `• 🚒 **Piknik i Pokazy Strażackie OSP** – 12 Lipca o 14:00 (Park Zofii Tymbark).\n`
      }
      resp += `\nMożesz kliknąć w dane wydarzenie w kalendarzu na stronie **Społeczność**, aby zapisać się lub otworzyć jego dedykowany czat!`
      return resp
    }

    // 3. Check help/engagement questions
    if (text.includes('pomoc') || text.includes('zaangaż') || text.includes('sąsiedz') || text.includes('usterk') || text.includes('zgłoś') || text.includes('inicjatyw')) {
      return `Wspieranie naszej lokalnej społeczności w Tymbarku jest niezwykle proste i nagradzające! ❤️\n\n**Oto jak możesz pomóc:**\n\n1. 🛠️ **Zgłaszaj usterki w okolicy**:\nKliknij przycisk **„+” (plus)** na dole ekranu i wybierz czerwoną opcję **„Zgłoś”**. Możesz dodać zdjęcie dziury w drodze, zniszczonej ławki lub niedziałającej latarni, a nawet nagrać opis głosowy! Dostaniesz za to **+10 pkt**.\n\n2. 🤝 **Bierz udział w akcjach sąsiedzkich**:\nZapisuj się na wydarzenia ekologiczne i społeczne (np. *Sąsiedzkie Repair Cafe*). Ucz się naprawiać sprzęty i wymieniaj się rzeczami z sąsiadami. Zyskasz **+20 pkt** i wejdziesz do grupowej społeczności.\n\n3. 💡 **Twórz własne inicjatywy**:\nJuż wkrótce będziesz mógł zgłaszać własne pomysły na rozwój gminy i zbierać pod nimi głosy poparcia sąsiadów!`
    }

    // 4. Greetings
    if (text.includes('cześć') || text.includes('hej') || text.includes('siema') || text.includes('witam') || text.includes('hello')) {
      return `Cześć ${userName}! Miło Cię słyszeć. 😊 W czym mogę pomóc? Mogę opowiedzieć Ci o wydarzeniach, punktach lojalnościowych lub o tym, jak zgłosić usterkę w Tymbarku.`
    }

    // 5. Default fallback
    return `Ciekawa sprawa! Jako Asystent Tymbark AI skupiam się na wspieraniu życia w naszej gminie. \n\nMożesz zapytać mnie o:\n• **Najbliższe wydarzenia** (np. *„co dzieje się w okolicy?”*)\n• **Punkty w portfelu i nagrody** (np. *„ile mam punktów?”*)\n• **Zgłaszanie usterek** (np. *„jak zgłosić problem z latarnią?”*)\n\nChętnie odpowiem na każde z tych pytań!`
  }

  // Handle message submission
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue
    if (!text.trim()) return

    const userMessage = {
      id: 'msg-' + Date.now(),
      from: 'user',
      text: text,
      time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })
    }

    // Add user message to screen and clear input
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Check if we can and should use the live Groq API
    if (usingLiveAPI && isKeyConfigured) {
      try {
        const systemPrompt = generateSystemPrompt(currentUser, events)
        
        // Compile complete chat conversation history for multi-turn awareness
        const conversationHistory = [...messages, userMessage]
        const apiMessages = conversationHistory.map(msg => ({
          role: msg.from === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))

        // Call Groq OpenAI-compatible Chat Completions endpoint
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              ...apiMessages
            ],
            temperature: 0.6,
            max_tokens: 800
          })
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData?.error?.message || `API error status: ${response.status}`)
        }

        const data = await response.json()
        const responseText = data?.choices?.[0]?.message?.content || ''

        if (!responseText.trim()) {
          throw new Error('Pusta odpowiedź z API.')
        }

        const botMessage = {
          id: 'bot-' + Date.now(),
          from: 'bot',
          text: responseText,
          time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)

      } catch (err) {
        console.error('Błąd Groq API - następuje automatyczny fallback:', err)
        
        // Graceful fallback to smart local response engine
        const fallbackText = getAIResponse(text)
        const responseText = `⚠️ *(Połączenie z chmurą przerwane. Silnik lokalny offline)*\n\n${fallbackText}`

        const botMessage = {
          id: 'bot-' + Date.now(),
          from: 'bot',
          text: responseText,
          time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })
        }

        // Toggle badge state and show manual env tip
        setUsingLiveAPI(false)
        setShowKeyWarning(true)
        
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }
    } else {
      // Local Smart Mock Engine Fallback (Instant or very slight simulated delay)
      setTimeout(() => {
        const responseText = getAIResponse(text)
        const botMessage = {
          id: 'bot-' + Date.now(),
          from: 'bot',
          text: responseText,
          time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 1000)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Sheet Container */}
      <div className="relative w-full max-w-md bg-white rounded-t-4xl shadow-2xl animate-slide-up h-[78%] flex flex-col overflow-hidden border-t border-card-border">
        
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between bg-gradient-to-r from-forest/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center shadow-md">
              <Bot size={19} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-graphite">
                  Asystent Tymbark AI
                </h3>
              </div>
              <p className="text-[9px] text-graphite-light font-semibold mt-0.5">Baza wiedzy gminy i mieszkańców</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-soft-bg hover:bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-sm"
            aria-label="Zamknij"
          >
            <X size={12} className="text-graphite" />
          </button>
        </div>

        {/* Chat Messages viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-soft-bg/40 scrollbar-thin scrollbar-thumb-gray-250">
          
          {/* Informative Environment Key Tip Banner */}
          {showKeyWarning && !usingLiveAPI && (
            <div className="mb-4 p-3 bg-indigo-50/90 border border-indigo-100/60 rounded-2xl relative shadow-sm backdrop-blur-sm animate-fade-in flex items-start gap-2.5">
              <div className="p-1.5 bg-white rounded-lg text-indigo-600 shadow-sm flex-shrink-0 mt-0.5">
                <Sparkles size={13} className="animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-extrabold text-indigo-950 mb-0.5 flex items-center gap-1">
                  Połącz Chatbota z chmurą Groq! ⚡
                </h4>
                <p className="text-[9px] text-indigo-900/80 leading-relaxed font-semibold">
                  Obecnie pracujesz w trybie mock offline. Aby aktywować superszybki model **Llama 3.3 (250 tok/s)**, dodaj klucz w pliku `.env`:
                  <code className="block mt-1 p-1 bg-indigo-950 text-indigo-200 rounded text-[8px] font-mono select-all break-all">VITE_GROQ_API_KEY="twój-klucz-groq"</code>
                </p>
              </div>
              <button 
                onClick={() => setShowKeyWarning(false)}
                className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600 transition-colors p-1"
                aria-label="Zamknij wskazówkę"
              >
                <X size={10} />
              </button>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[85%] ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.from === 'user' ? 'bg-forest/10' : 'bg-forest text-white'
                }`}>
                  {msg.from === 'user' ? (
                    <User size={13} className="text-forest" />
                  ) : (
                    <Bot size={13} />
                  )}
                </div>

                {/* Bubble */}
                <div className={`px-3.5 py-2.5 rounded-2xl text-[11.5px] leading-relaxed shadow-sm whitespace-pre-line border ${
                  msg.from === 'user'
                    ? 'bg-forest text-white rounded-tr-none border-forest/20'
                    : 'bg-white text-graphite rounded-tl-none border-gray-100'
                }`}>
                  {msg.text.split('**').map((part, index) => 
                    index % 2 === 1 ? (
                      <strong 
                        key={index} 
                        className={msg.from === 'user' ? 'text-amber-200 font-extrabold' : 'text-forest font-extrabold'}
                      >
                        {part}
                      </strong>
                    ) : part
                  )}
                  <span className={`block text-[8px] mt-1.5 text-right ${
                    msg.from === 'user' ? 'text-white/60' : 'text-gray-400'
                  }`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%] animate-pulse">
                <div className="w-6.5 h-6.5 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot size={13} />
                </div>
                <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin text-forest" />
                  <span className="text-[10px] font-extrabold text-forest">Asystent analizuje dane...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestions chips and Input bar */}
        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0 pb-20">
          {/* Quick Suggestions Chips */}
          {messages.length === 1 && !isTyping && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-3.5 -mx-4 px-4">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSendMessage(s.text)}
                  className="px-3.5 py-2 rounded-full bg-soft-bg hover:bg-forest/5 border border-card-border text-[9.5px] font-bold text-graphite whitespace-nowrap active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <MessageSquare size={10} className="text-forest" />
                  {s.text}
                </button>
              ))}
            </div>
          )}

          {/* Input field */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Zapytaj o punkty, nagrody lub wydarzenia..."
              className="flex-1 px-3.5 py-3 bg-soft-bg/50 rounded-xl text-[12px] outline-none border border-card-border focus:ring-2 focus:ring-forest/20 text-graphite font-semibold placeholder-gray-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none shadow-md"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AIChatModal
