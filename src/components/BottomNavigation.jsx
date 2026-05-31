import React from 'react'
import { Home, Map, Users, Gift } from 'lucide-react'
import { IonFooter } from '@ionic/react'

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
    <IonFooter className="ion-no-border bg-transparent z-[1002] absolute bottom-0 left-0 right-0 w-full pointer-events-none">
      <nav
        className="w-full pointer-events-auto"
        role="navigation"
        aria-label="Nawigacja główna"
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] w-full pt-2 pb-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-5 items-center">
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
    </IonFooter>
  )
}

export default BottomNavigation
