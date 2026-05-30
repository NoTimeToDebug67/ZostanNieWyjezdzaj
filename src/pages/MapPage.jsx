import React, { useState } from 'react'
import { Navigation, Users, MapPin, X, Layers } from 'lucide-react'

const mockPins = [
  {
    id: 1,
    title: 'Kościół pw. św. Michała Archanioła',
    description: 'Zabytkowy kościół z XVII wieku – perła drewnianej architektury sakralnej Małopolski.',
    type: 'landmark',
    image: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400&h=200&fit=crop',
    action: 'Nawiguj',
  },
  {
    id: 2,
    title: 'Piknik sąsiedzki w parku',
    description: 'Sobota, 14:00. Gry, muzyka na żywo i wspólne grillowanie dla wszystkich mieszkańców.',
    type: 'event',
    image: 'https://images.unsplash.com/photo-1529543544006-1bd3f5ba0c2a?w=400&h=200&fit=crop',
    action: 'Dołącz',
  },
]

function MapPage() {
  const [selectedPin, setSelectedPin] = useState(null)
  const [mapLayer, setMapLayer] = useState('default')

  return (
    <div className="relative h-screen">
      {/* Map layer toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setMapLayer(mapLayer === 'default' ? 'satellite' : 'default')}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-glass flex items-center justify-center border border-card-border hover:bg-white transition-colors"
          aria-label="Zmień warstwę mapy"
        >
          <Layers size={18} className="text-forest" />
        </button>
      </div>

      {/* Map - placeholder with realistic look */}
      <div className="w-full h-full bg-gradient-to-b from-green-50/50 to-emerald-50/30 relative overflow-hidden">
        {/* Simulated terrain */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.08]">
            <pattern id="topo" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="20" fill="none" stroke="#2D6A4F" strokeWidth="0.5"/>
              <circle cx="30" cy="30" r="12" fill="none" stroke="#2D6A4F" strokeWidth="0.3"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#topo)" />
          </svg>
        </div>

        {/* Roads simulation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-500 rotate-3" />
          <div className="absolute top-1/2 left-1/4 bottom-0 w-0.5 bg-gray-500 -rotate-6" />
        </div>

        {/* Pins */}
        <button
          onClick={() => setSelectedPin(mockPins[0])}
          className="absolute top-[35%] left-[30%] group"
          aria-label={mockPins[0].title}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <MapPin size={18} className="text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-forest rounded-full opacity-30 animate-pulse-soft" />
          </div>
        </button>

        <button
          onClick={() => setSelectedPin(mockPins[1])}
          className="absolute top-[55%] right-[25%] group"
          aria-label={mockPins[1].title}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-warm-orange rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Users size={18} className="text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-warm-orange rounded-full opacity-30 animate-pulse-soft" />
          </div>
        </button>

        {/* Center label */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md rounded-xl px-3 py-2 shadow-sm border border-card-border">
          <p className="text-[11px] font-semibold text-forest">Tymbark i okolice</p>
        </div>
      </div>

      {/* Bottom panel - pin details */}
      {selectedPin && (
        <div className="absolute bottom-0 left-0 right-0 z-30 animate-slide-up">
          <div className="bg-white rounded-t-4xl shadow-2xl overflow-hidden">
            {/* Image */}
            <div className="relative h-36">
              <img
                src={selectedPin.image}
                alt={selectedPin.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPin(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center"
                aria-label="Zamknij"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-base font-bold text-graphite mb-1.5">
                {selectedPin.title}
              </h3>
              <p className="text-sm text-graphite-light leading-relaxed mb-4">
                {selectedPin.description}
              </p>

              <button className="w-full py-3.5 gradient-primary text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]">
                {selectedPin.action === 'Nawiguj' ? <Navigation size={16} /> : <Users size={16} />}
                {selectedPin.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapPage
