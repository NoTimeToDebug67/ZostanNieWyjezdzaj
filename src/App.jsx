import React, { useState } from 'react'
import BottomNavigation from './components/BottomNavigation'
import FAB from './components/FAB'
import StartPage from './pages/StartPage'
import MapPage from './pages/MapPage'
import CommunityPage from './pages/CommunityPage'
import WalletPage from './pages/WalletPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const [activeTab, setActiveTab] = useState('start')
  const [fabOpen, setFabOpen] = useState(false)

  const renderPage = () => {
    switch (activeTab) {
      case 'start':
        return <StartPage onNavigate={setActiveTab} />
      case 'map':
        return <MapPage />
      case 'community':
        return <CommunityPage />
      case 'wallet':
        return <WalletPage />
      case 'profile':
        return <ProfilePage />
      default:
        return <StartPage onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-soft-bg overflow-hidden border-x border-gray-100 shadow-2xl">
      {/* Status bar simulation */}
      <div className="sticky top-0 z-50 h-11 bg-soft-bg flex items-center justify-between px-6">
        <span className="text-[11px] font-semibold text-graphite">9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <div className="w-1 h-2.5 bg-graphite rounded-sm" />
            <div className="w-1 h-3 bg-graphite rounded-sm" />
            <div className="w-1 h-3.5 bg-graphite rounded-sm" />
            <div className="w-1 h-4 bg-graphite rounded-sm" />
          </div>
          <div className="w-6 h-3 border border-graphite rounded-sm ml-1 relative">
            <div className="absolute inset-0.5 bg-graphite rounded-[1px]" style={{ width: '70%' }} />
          </div>
        </div>
      </div>

      {/* Overlay when FAB is open */}
      {fabOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setFabOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main className="pb-28 min-h-screen">
        {renderPage()}
      </main>

      {/* FAB */}
      <FAB isOpen={fabOpen} onToggle={() => setFabOpen(!fabOpen)} />

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setFabOpen(false); }} />
    </div>
  )
}

export default App
