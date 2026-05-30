import React, { useState } from 'react'
import { QrCode, Trophy, Star, Gift, X } from 'lucide-react'

const rewards = [
  {
    id: 1,
    title: 'Piekarnia u Kasi',
    discount: '-15%',
    description: 'Na wszystkie wypieki',
    validUntil: '31.12.2026',
    emoji: '🥐',
    code: 'TYM-PIEK-2026',
  },
  {
    id: 2,
    title: 'Restauracja Pod Lipą',
    discount: '-10%',
    description: 'Na obiady w tygodniu',
    validUntil: '28.02.2027',
    emoji: '🍽️',
    code: 'TYM-REST-2027',
  },
  {
    id: 3,
    title: 'Sklep Ogrodniczy',
    discount: '-20%',
    description: 'Na nasiona i sadzonki',
    validUntil: '15.01.2027',
    emoji: '🌱',
    code: 'TYM-OGRD-2027',
  },
]

function WalletPage() {
  const [selectedReward, setSelectedReward] = useState(null)
  const points = 340
  const nextReward = 500
  const progress = Math.round((points / nextReward) * 100)

  return (
    <div className="px-4 space-y-5">
      {/* Header */}
      <div className="py-1">
        <h1 className="text-lg font-bold text-graphite">Portfel</h1>
        <p className="text-[11px] text-graphite-light">Nagrody za aktywność</p>
      </div>

      {/* Points card - compact */}
      <div className="card-base overflow-hidden">
        <div className="gradient-primary p-5 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />

          <div className="relative z-10 flex items-center gap-4">
            {/* Circular progress */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="url(#progressGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 1.76} ${176 - progress * 1.76}`}
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#FBBF24" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy size={18} className="text-yellow-300" />
              </div>
            </div>

            {/* Points info */}
            <div>
              <div className="text-2xl font-bold text-white">{points}</div>
              <p className="text-[11px] text-white/60">punktów</p>
              <p className="text-[10px] text-white/40 mt-0.5">
                {nextReward - points} do nagrody
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex divide-x divide-card-border">
          <div className="flex-1 py-3 text-center">
            <span className="text-sm font-bold text-forest">7</span>
            <p className="text-[9px] text-graphite-light">Zgłoszeń</p>
          </div>
          <div className="flex-1 py-3 text-center">
            <span className="text-sm font-bold text-warm-orange">3</span>
            <p className="text-[9px] text-graphite-light">Inicjatyw</p>
          </div>
          <div className="flex-1 py-3 text-center">
            <span className="text-sm font-bold text-mint">12</span>
            <p className="text-[9px] text-graphite-light">Głosów</p>
          </div>
        </div>
      </div>

      {/* How to earn */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {[
          { label: 'Zgłoś usterkę', pts: '+10', emoji: '🔧' },
          { label: 'Oddaj głos', pts: '+5', emoji: '🗳️' },
          { label: 'Dodaj inicjatywę', pts: '+20', emoji: '💡' },
          { label: 'Dołącz do grupy', pts: '+15', emoji: '👥' },
        ].map((action, i) => (
          <div key={i} className="bg-white rounded-xl border border-card-border p-2.5 min-w-[100px] flex-shrink-0 text-center">
            <span className="text-lg">{action.emoji}</span>
            <p className="text-[9px] text-graphite-light mt-1">{action.label}</p>
            <p className="text-[10px] font-bold text-forest">{action.pts}</p>
          </div>
        ))}
      </div>

      {/* Rewards */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-graphite uppercase tracking-wider">Twoje zniżki</h2>
          <span className="text-[10px] text-warm-orange font-semibold flex items-center gap-0.5">
            <Gift size={10} /> {rewards.length}
          </span>
        </div>

        <div className="space-y-2">
          {rewards.map((reward) => (
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
              </div>
              <span className="text-sm font-bold text-forest">{reward.discount}</span>
            </button>
          ))}
        </div>
      </section>

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

            {/* QR placeholder */}
            <div className="w-32 h-32 mx-auto mt-4 bg-soft-bg rounded-2xl flex items-center justify-center border border-card-border">
              <QrCode size={48} className="text-graphite/20" />
            </div>
            <p className="text-[10px] text-graphite-light mt-2">Pokaż przy kasie</p>
            <p className="text-[9px] text-gray-400 mt-1 font-mono">{selectedReward.code}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletPage
