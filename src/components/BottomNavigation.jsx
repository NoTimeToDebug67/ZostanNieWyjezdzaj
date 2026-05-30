import React from 'react'
import { Home, Map, Users, Gift } from 'lucide-react'

const tabs = [
  { id: 'start', label: 'Start', icon: Home },
  { id: 'map', label: 'Mapa', icon: Map },
  // spacer for FAB
  { id: '_spacer', label: '', icon: null },
  { id: 'community', label: 'Społeczność', icon: Users },
  { id: 'wallet', label: 'Nagrody', icon: Gift },
]

function BottomNavigation({ activeTab, onTabChange }) {
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 w-full z-30"
      role="navigation"
      aria-label="Nawigacja główna"
    >
      <div className="bg-white border-t border-gray-100 safe-bottom">
        <div className="grid grid-cols-5 items-center pt-2 pb-1">
          {tabs.map((tab) => {
            if (tab.id === '_spacer') {
              return <div key={tab.id} aria-hidden="true" />
            }

            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-200 ${
                  isActive ? 'text-forest' : 'text-gray-400'
                }`}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                <span className={`text-[9px] font-medium ${isActive ? 'text-forest' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default BottomNavigation
