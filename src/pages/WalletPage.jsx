import React, { useState } from 'react'
import { QrCode, Trophy, Gift, X, Info, ShoppingBag, Tag } from 'lucide-react'
import { IonPage, IonContent } from '@ionic/react'
import { useAuth } from '../context/AuthContext'

const availableRewards = [
  { id: 'buy-1', title: 'Kino Małopolska', discount: '-30%', description: 'Na dowolny seans', price: 80, emoji: '🎬', code: 'TYM-KINO-2026' },
  { id: 'buy-2', title: 'Basen Termalny', discount: '-25%', description: 'Wejście całodniowe', price: 120, emoji: '🏊', code: 'TYM-BASN-2026' },
  { id: 'buy-3', title: 'Kwiaciarnia Flora', discount: '-20%', description: 'Na bukiety i doniczki', price: 60, emoji: '💐', code: 'TYM-FLOR-2027' },
  { id: 'buy-4', title: 'Warsztat rowerowy', discount: '-15%', description: 'Na przegląd i naprawy', price: 50, emoji: '🚲', code: 'TYM-ROWER-2027' },
]

function WalletPage() {
  const { currentUser, redeemReward } = useAuth()
  const [selectedReward, setSelectedReward] = useState(null)
  const [rewardTab, setRewardTab] = useState('mine') // 'mine' | 'shop'
  const [showPointsInfo, setShowPointsInfo] = useState(false)
  const [rewardToBuy, setRewardToBuy] = useState(null)
  const [purchaseSuccessReward, setPurchaseSuccessReward] = useState(null)

  if (!currentUser) return null

  const points = currentUser.points
  const rewards = (currentUser.rewards || []).map(r => ({
    ...r,
    validUntil: typeof r.validUntil === 'string' ? new Date(r.validUntil) : r.validUntil
  }))

  const handleBuyReward = (reward) => {
    setRewardToBuy(reward)
  }

  const handleConfirmPurchase = async () => {
    if (!rewardToBuy) return
    const reward = rewardToBuy
    setRewardToBuy(null)
    
    const res = await redeemReward(reward)
    if (res && res.success) {
      setPurchaseSuccessReward(reward)
      setRewardTab('mine')
    } else {
      alert(res?.error || 'Wystąpił błąd podczas zakupu.')
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true} className="ion-no-padding" style={{ '--background': 'transparent' }}>
        <div className="px-4 space-y-4 pb-28 pt-2">
      {/* Header */}
      <div className="py-1">
        <h1 className="text-lg font-bold text-graphite">Nagrody</h1>
        <p className="text-[11px] text-graphite-light">Zniżki i benefity za aktywność</p>
      </div>

      {/* Points card - simple, no progress bar */}
      <div className="card-base overflow-hidden">
        <div className="gradient-primary p-5 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Trophy size={22} className="text-yellow-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{points}</div>
                <p className="text-[11px] text-white/60">punktów</p>
              </div>
            </div>

            {/* Info button - how to earn */}
            <button
              onClick={() => setShowPointsInfo(!showPointsInfo)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Jak zdobywać punkty"
            >
              <Info size={14} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex divide-x divide-card-border">
          <div className="flex-1 py-3 text-center">
            <span className="text-sm font-bold text-forest">{currentUser.stats.reports}</span>
            <p className="text-[9px] text-graphite-light">Zgłoszeń</p>
          </div>
          <div className="flex-1 py-3 text-center">
            <span className="text-sm font-bold text-warm-orange">{currentUser.stats.initiatives}</span>
            <p className="text-[9px] text-graphite-light">Inicjatyw</p>
          </div>
          <div className="flex-1 py-3 text-center">
            <span className="text-sm font-bold text-mint">{currentUser.stats.votes}</span>
            <p className="text-[9px] text-graphite-light">Głosów</p>
          </div>
        </div>
      </div>

      {/* Points info - collapsible */}
      {showPointsInfo && (
        <div className="card-base p-3 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-bold text-graphite uppercase tracking-wider">Jak zdobywać punkty</h3>
            <button onClick={() => setShowPointsInfo(false)} className="w-5 h-5 rounded-full bg-soft-bg flex items-center justify-center">
              <X size={10} className="text-graphite-light" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Zgłoś usterkę', pts: '+10', emoji: '🔧' },
              { label: 'Oddaj głos', pts: '+5', emoji: '🗳️' },
              { label: 'Dodaj inicjatywę', pts: '+20', emoji: '💡' },
              { label: 'Dołącz do grupy', pts: '+15', emoji: '👥' },
              { label: 'Zapisz się na event', pts: '+10', emoji: '📅' },
              { label: 'Dodaj wydarzenie', pts: '+25', emoji: '🎉' },
            ].map((action, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-soft-bg rounded-lg">
                <span className="text-sm">{action.emoji}</span>
                <div>
                  <p className="text-[9px] text-graphite-light leading-tight">{action.label}</p>
                  <p className="text-[10px] font-bold text-forest">{action.pts}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewards tabs: Twoje / Sklep */}
      <div className="flex bg-white rounded-xl border border-card-border p-1 shadow-card">
        <button
          onClick={() => setRewardTab('mine')}
          className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            rewardTab === 'mine' ? 'bg-forest text-white shadow-sm' : 'text-graphite-light'
          }`}
        >
          <Tag size={12} /> Twoje zniżki
        </button>
        <button
          onClick={() => setRewardTab('shop')}
          className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            rewardTab === 'shop' ? 'bg-forest text-white shadow-sm' : 'text-graphite-light'
          }`}
        >
          <ShoppingBag size={12} /> Wymień punkty
        </button>
      </div>

      {/* TAB: Twoje zniżki */}
      {rewardTab === 'mine' && (
        <section className="space-y-2">
          {rewards.length > 0 ? rewards.map((reward) => {
            const timeLeftMs = reward.validUntil.getTime() - Date.now()
            const isExpiringSoon = timeLeftMs < 5 * 24 * 60 * 60 * 1000

            // Format expiry text and class dynamically
            let expiryText = `Ważne do: ${reward.validUntil.toLocaleDateString('pl-PL')}`
            let expiryClass = 'text-gray-400'

            if (timeLeftMs > 0) {
              if (timeLeftMs < 24 * 60 * 60 * 1000) {
                // Expiring in less than 24h
                const hours = Math.floor(timeLeftMs / (1000 * 60 * 60))
                const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60))
                expiryText = `Kończy się za: ${hours}h ${minutes}m!`
                expiryClass = 'text-red-500 font-bold animate-pulse'
              } else if (isExpiringSoon) {
                expiryClass = 'text-amber-600 font-semibold'
              }
            } else {
              expiryText = 'Wygasła'
              expiryClass = 'text-red-600 font-bold line-through'
            }

            return (
              <button
                key={reward.id}
                onClick={() => setSelectedReward(reward)}
                className="w-full card-base p-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-11 h-11 rounded-xl bg-soft-bg flex items-center justify-center text-xl flex-shrink-0">
                  {reward.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[12px] font-semibold text-graphite">{reward.title}</h3>
                  <p className="text-[10px] text-graphite-light">{reward.description}</p>
                  <p className={`text-[9px] mt-0.5 ${expiryClass}`}>
                    {expiryText}
                  </p>
                </div>
                <span className="text-sm font-bold text-forest">{reward.discount}</span>
              </button>
            )
          }) : (
            <div className="card-base py-8 text-center flex flex-col items-center gap-2">
              <Gift size={24} className="text-gray-300" />
              <p className="text-[11px] text-graphite-light">Brak aktywnych zniżek</p>
              <p className="text-[10px] text-graphite-light">Wymień punkty na zniżki w sklepie!</p>
            </div>
          )}
        </section>
      )}

      {/* TAB: Sklep - dostępne do kupienia */}
      {rewardTab === 'shop' && (
        <section className="space-y-2">
          <p className="text-[10px] text-graphite-light px-1">Wymień zebrane punkty na zniżki u lokalnych partnerów:</p>
          {availableRewards.map((reward) => {
            const canAfford = points >= reward.price
            return (
              <div
                key={reward.id}
                className={`card-base p-3.5 flex items-center gap-3 ${!canAfford ? 'opacity-50' : ''}`}
              >
                <div className="w-11 h-11 rounded-xl bg-soft-bg flex items-center justify-center text-xl flex-shrink-0">
                  {reward.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[12px] font-semibold text-graphite">{reward.title}</h3>
                  <p className="text-[10px] text-graphite-light">{reward.description}</p>
                  <p className="text-[9px] font-bold text-forest mt-0.5">{reward.price} pkt</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-bold text-forest">{reward.discount}</span>
                  <button
                    disabled={!canAfford}
                    onClick={() => handleBuyReward(reward)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${
                      canAfford
                        ? 'gradient-primary text-white active:scale-95'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Kup' : 'Za mało pkt'}
                  </button>
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* QR Modal */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedReward(null)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-[280px] shadow-2xl animate-slide-up text-center">
            <button
              onClick={() => setSelectedReward(null)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-soft-bg flex items-center justify-center"
              aria-label="Zamknij"
            >
              <X size={14} className="text-graphite-light" />
            </button>
            <span className="text-3xl">{selectedReward.emoji}</span>
            <h3 className="text-sm font-bold text-graphite mt-2">{selectedReward.title}</h3>
            <p className="text-2xl font-bold text-forest mt-1">{selectedReward.discount}</p>
            <p className="text-[11px] text-graphite-light mt-1">{selectedReward.description}</p>
            <div className="w-32 h-32 mx-auto mt-4 bg-soft-bg rounded-2xl flex items-center justify-center border border-card-border">
              <QrCode size={48} className="text-graphite/20" />
            </div>
            <p className="text-[10px] text-graphite-light mt-2">Pokaż przy kasie</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {rewardToBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRewardToBuy(null)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-[280px] shadow-2xl animate-slide-up text-center border border-card-border">
            <span className="text-4xl animate-bounce inline-block">{rewardToBuy.emoji}</span>
            <h3 className="text-[13px] font-extrabold text-graphite mt-3">Czy na pewno chcesz zakupić rabat?</h3>
            <p className="text-[11px] text-graphite-light mt-2 leading-relaxed">
              Z Twojego konta zostanie pobrane <strong className="text-forest font-bold">{rewardToBuy.price} pkt</strong> na zniżkę <strong className="text-forest font-bold">{rewardToBuy.discount}</strong> w <strong>{rewardToBuy.title}</strong>.
            </p>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setRewardToBuy(null)}
                className="flex-1 py-2.5 bg-gray-50 border border-gray-150 hover:bg-gray-100 text-graphite text-[10px] font-bold rounded-xl active:scale-95 transition-all"
              >
                Anuluj
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 py-2.5 gradient-primary text-white text-[10px] font-bold rounded-xl active:scale-95 transition-all shadow-md"
              >
                Kupuję
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {purchaseSuccessReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPurchaseSuccessReward(null)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-[280px] shadow-2xl animate-slide-up text-center border border-card-border">
            <span className="text-4xl inline-block">🎉</span>
            <h3 className="text-[13px] font-extrabold text-graphite mt-3">Zniżka zakupiona! 🌟</h3>
            <p className="text-[11px] text-graphite-light mt-2 leading-relaxed">
              Pomyślnie wymieniono punkty na rabat <strong className="text-forest font-bold">{purchaseSuccessReward.discount}</strong> do <strong>{purchaseSuccessReward.title}</strong>.
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Znajdziesz ją teraz w zakładce "Twoje zniżki".</p>
            <button
              onClick={() => setPurchaseSuccessReward(null)}
              className="w-full mt-5 py-2.5 gradient-primary text-white text-[10px] font-bold rounded-xl active:scale-95 transition-all shadow-md"
            >
              Super!
            </button>
          </div>
        </div>
      )}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default WalletPage
