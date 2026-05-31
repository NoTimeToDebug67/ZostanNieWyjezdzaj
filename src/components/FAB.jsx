import React from 'react'
import { Plus, AlertTriangle, Lightbulb, MessageCircle } from 'lucide-react'

const fabActions = [
  {
    id: 'report',
    label: 'Zgłoś',
    icon: AlertTriangle,
    color: 'bg-red-500',
    angle: -144,
  },
  {
    id: 'initiative',
    label: "Nowe\nwydarzenie",
    icon: Lightbulb,
    color: 'bg-warm-orange',
    angle: -90,
  },
  {
    id: 'ask-ai',
    label: 'Pytaj',
    icon: MessageCircle,
    color: 'bg-forest-mid',
    angle: -40,
  },
]

function FAB({ isOpen, onToggle, onAction }) {
  const radius = 76

  return (
    <div className="absolute bottom-[70px] sm:bottom-[22px] left-1/2 -translate-x-1/2 z-[1003]">
      {/* Radial action buttons */}
      {fabActions.map((action, index) => {
        const angleRad = (action.angle * Math.PI) / 180
        const x = Math.cos(angleRad) * radius
        const y = Math.sin(angleRad) * radius - 36

        return (
          <div
            key={action.id}
            className={`absolute left-1/2 top-1/2 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            style={{
              transform: isOpen
                ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                : 'translate(-50%, -50%)',
              transitionDelay: isOpen ? `${index * 40}ms` : '0ms',
            }}
          >
            <button
              onClick={() => {
                if (onAction) onAction(action.id)
              }}
              className={`relative flex items-center justify-center w-11 h-11 rounded-full ${action.color} text-white shadow-lg hover:scale-110 active:scale-95 transition-transform`}
              aria-label={action.label.replace('\n', ' ')}
            >
              <action.icon size={17} />
            </button>
            <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-800 bg-white/95 border border-card-border rounded-xl px-2 py-0.5 shadow-glass text-center whitespace-pre-line pointer-events-none transition-all duration-200 w-[64px] leading-tight">
              {action.label}
            </span>
          </div>
        )
      })}

      {/* Main FAB */}
      <button
        onClick={onToggle}
        className={`relative w-13 h-13 w-[52px] h-[52px] rounded-full gradient-primary shadow-fab flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-90 ${isOpen ? 'rotate-45' : 'rotate-0'
          }`}
        aria-label={isOpen ? 'Zamknij menu' : 'Otwórz menu akcji'}
        aria-expanded={isOpen}
      >
        <Plus size={24} className="text-white" strokeWidth={2.5} />
      </button>
    </div>
  )
}

export default FAB
