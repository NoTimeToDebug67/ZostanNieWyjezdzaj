import React from 'react'
import {
  Settings,
  Bell,
  Shield,
  ChevronRight,
  MapPin,
  LogOut,
  HelpCircle,
  Palette,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function ProfilePage() {
  const { currentUser, logout } = useAuth()

  if (!currentUser) return null

  const menuItems = [
    { id: 'village', label: 'Moje sołectwo', icon: MapPin, value: `Sołectwo ${currentUser.village}` },
    { id: 'notifications', label: 'Powiadomienia', icon: Bell, value: 'Włączone' },
    { id: 'appearance', label: 'Wygląd', icon: Palette, value: '' },
    { id: 'privacy', label: 'Prywatność', icon: Shield, value: '' },
    { id: 'help', label: 'Pomoc', icon: HelpCircle, value: '' },
    { id: 'settings', label: 'Ustawienia', icon: Settings, value: '' },
  ]

  const userInitial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'

  return (
    <div className="px-5 pt-4 space-y-5 flex-1 overflow-y-auto pb-28">
      {/* Profile card */}
      <div className="card-base p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
              <span className="text-white text-xl font-bold">{userInitial}</span>
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-mint rounded-full border-2 border-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-graphite">{currentUser.name}</h2>
            <p className="text-xs text-graphite-light">Sołectwo {currentUser.village} • od 2026</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="px-2 py-0.5 bg-mint-light/20 rounded-full">
                <span className="text-[10px] font-semibold text-forest">
                  {currentUser.points >= 200 ? 'Aktywny mieszkaniec 🏅' : 'Mieszkaniec 🌱'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="card-base p-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-soft-bg transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-forest/5 flex items-center justify-center">
                <Icon size={16} className="text-forest" />
              </div>
              <span className="flex-1 text-sm font-medium text-graphite">{item.label}</span>
              {item.value && (
                <span className="text-xs text-graphite-light mr-1">{item.value}</span>
              )}
              <ChevronRight size={14} className="text-gray-300" />
            </button>
          )
        })}
      </div>

      {/* Logout */}
      <button 
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-red-400 font-medium hover:text-red-500 transition-colors active:scale-95"
      >
        <LogOut size={16} />
        Wyloguj się
      </button>
    </div>
  )
}

export default ProfilePage
