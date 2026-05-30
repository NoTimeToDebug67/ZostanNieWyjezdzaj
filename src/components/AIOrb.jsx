import React, { useState, useEffect } from 'react'

/**
 * Living AI panel – cała ramka pulsuje/oddycha, 
 * tekst jest widoczny, interaktywny.
 */
function AIOrb({ message, onTap }) {
  const [glowPhase, setGlowPhase] = useState(0)

  // Subtle glow cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowPhase((p) => (p + 1) % 3)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const glowStyles = [
    'shadow-[0_0_20px_rgba(82,183,136,0.3)]',
    'shadow-[0_0_30px_rgba(82,183,136,0.5)]',
    'shadow-[0_0_20px_rgba(82,183,136,0.2)]',
  ]

  return (
    <button
      onClick={onTap}
      className="w-full text-left group"
      aria-label="Porozmawiaj z asystentem"
    >
      <div className={`relative rounded-3xl overflow-hidden border border-mint/30 bg-gradient-to-br from-forest via-forest-mid to-forest-light p-4 transition-shadow duration-1000 ${glowStyles[glowPhase]}`}>
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-3xl border border-mint-light/20 animate-pulse-soft pointer-events-none" />
        
        {/* Background particles */}
        <div className="absolute top-2 right-4 w-2 h-2 bg-mint-light/40 rounded-full animate-float" />
        <div className="absolute bottom-3 right-8 w-1.5 h-1.5 bg-mint-light/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-4 left-[60%] w-1 h-1 bg-white/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10">
          {/* Indicator dots - "thinking" */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-mint-light rounded-full animate-pulse-soft" />
              <div className="w-1.5 h-1.5 bg-mint-light/60 rounded-full animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
              <div className="w-1.5 h-1.5 bg-mint-light/30 rounded-full animate-pulse-soft" style={{ animationDelay: '0.8s' }} />
            </div>
            <span className="text-[10px] text-white/40 font-medium ml-1">Asystent</span>
          </div>

          {/* Message text - clearly visible */}
          <p className="text-[13px] text-white font-medium leading-relaxed">
            {message}
          </p>

          {/* CTA */}
          <div className="mt-3 flex items-center gap-2">
            <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20">
              <span className="text-[10px] text-white/80 font-medium">Dotknij, żeby porozmawiać →</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

export default AIOrb
