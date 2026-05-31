import React, { useState, useEffect } from 'react'
import BottomNavigation from './components/BottomNavigation'
import FAB from './components/FAB'
import ReportDefectModal from './components/ReportDefectModal'
import AIChatModal from './components/AIChatModal'
import StartPage from './pages/StartPage'
import MapPage from './pages/MapPage'
import CommunityPage from './pages/CommunityPage'
import WalletPage from './pages/WalletPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppContent() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('start')
  const [fabOpen, setFabOpen] = useState(false)
  const [showCommunityAddModal, setShowCommunityAddModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showAIChatModal, setShowAIChatModal] = useState(false)

  const handleFABAction = (actionId) => {
    if (actionId === 'initiative') {
      setActiveTab('community')
      setShowCommunityAddModal(true)
      setFabOpen(false)
    } else if (actionId === 'report') {
      setShowReportModal(true)
      setFabOpen(false)
    } else if (actionId === 'ask-ai') {
      setShowAIChatModal(true)
      setFabOpen(false)
    }
  }

  // Reset window scroll to top when changing tabs to prevent viewport offsets on non-scrollable pages like MapPage
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);
  // Redirect to login if user session is not available
  if (!currentUser) {
    return <LoginPage />
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'start':
        return <StartPage onNavigate={setActiveTab} />
      case 'map':
        return <MapPage />
      case 'community':
        return (
          <CommunityPage
            showAddEvent={showCommunityAddModal}
            setShowAddEvent={setShowCommunityAddModal}
          />
        )
      case 'wallet':
        return <WalletPage />
      case 'profile':
        return <ProfilePage />
      default:
        return <StartPage onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-soft-bg">


      {/* Overlay when FAB is open */}
      {fabOpen && (
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setFabOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {renderPage()}
      </main>

      {/* FAB */}
      <FAB
        isOpen={fabOpen}
        onToggle={() => setFabOpen(!fabOpen)}
        onAction={handleFABAction}
      />

      {/* Report Defect Modal */}
      <ReportDefectModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      {/* Tymbark AI Assistant Chatbot Modal */}
      <AIChatModal
        isOpen={showAIChatModal}
        onClose={() => setShowAIChatModal(false)}
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setFabOpen(false);
          setShowCommunityAddModal(false);
          setShowReportModal(false);
          setShowAIChatModal(false);
        }}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-0 sm:p-8 relative overflow-hidden">
        {/* Ambient desktop backdrop gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-forest-mid/10 rounded-full blur-3xl pointer-events-none hidden sm:block" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mint-light/5 rounded-full blur-3xl pointer-events-none hidden sm:block" />

        {/* Physical phone mock frame */}
        <div className="relative w-full max-w-md h-screen sm:h-[844px] bg-soft-bg sm:rounded-[40px] sm:shadow-[0_0_0_10px_#1e293b,0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
          {/* Dynamic Island / Notch on desktop */}
          <div className="hidden sm:flex absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 items-center justify-center pointer-events-none">
            <div className="w-2.5 h-2.5 bg-[#101010] rounded-full absolute right-4 border border-slate-900" />
          </div>

          <AppContent />
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
