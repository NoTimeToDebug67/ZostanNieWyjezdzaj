import React, { useState, useEffect } from 'react'

/**
 * "Sołtys" – lokalny asystent AI.
 * Pulsująca ramka z podpowiedzią + przycisk akcji bezpośrednio pod tekstem.
 */
function AIOrb({ message, actionLabel, onAction }) {
  const [glowPhase, setGlowPhase] = useState(0)

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
    <div className={`relative rounded-3xl overflow-hidden border border-mint/30 bg-gradient-to-br from-forest via-forest-mid to-forest-light p-4 transition-shadow duration-1000 ${glowStyles[glowPhase]}`}>
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-3xl border border-mint-light/20 animate-pulse-soft pointer-events-none" />

      {/* Background particles */}
      <div className="absolute top-2 right-4 w-2 h-2 bg-mint-light/40 rounded-full animate-float" />
      <div className="absolute bottom-3 right-8 w-1.5 h-1.5 bg-mint-light/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-4 left-[60%] w-1 h-1 bg-white/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-mint-light rounded-full animate-pulse-soft" />
            <div className="w-1.5 h-1.5 bg-mint-light/60 rounded-full animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
            <div className="w-1.5 h-1.5 bg-mint-light/30 rounded-full animate-pulse-soft" style={{ animationDelay: '0.8s' }} />
          </div>
          <span className="text-[10px] text-white/50 font-semibold ml-1">Sołtys AI</span>
        </div>

        {/* Message */}
        <p className="text-[13px] text-white font-medium leading-relaxed">
          {message}
        </p>

        {/* Action button */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-3 w-full py-2.5 bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 text-[11px] text-white font-semibold text-center transition-colors active:scale-[0.97]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default AIOrb
