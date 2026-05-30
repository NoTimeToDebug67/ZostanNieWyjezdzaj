import React, { useState, useEffect } from 'react'
import { Navigation, Users, MapPin, X, Layers, Search, Loader2, Compass } from 'lucide-react'
import { MapContainer, TileLayer, GeoJSON, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Centroid of Tymbark (powiat limanowski, województwo małopolskie)
const TYMBARK_COORDS = [49.7294, 20.3118];

const mockPins = [
  {
    id: 1,
    title: 'Kościół pw. św. Michała Archanioła',
    description: 'Zabytkowy kościół z XVII wieku – perła drewnianej architektury sakralnej Małopolski.',
    type: 'landmark',
    coords: [49.719, 20.298], // Close to Tymbark center
    image: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400&h=200&fit=crop',
    action: 'Nawiguj',
  },
  {
    id: 2,
    title: 'Piknik sąsiedzki w parku',
    description: 'Sobota, 14:00. Gry, muzyka na żywo i wspólne grillowanie dla wszystkich mieszkańców.',
    type: 'event',
    coords: [49.734, 20.315], // Inside Tymbark
    image: 'https://images.unsplash.com/photo-1529543544006-1bd3f5ba0c2a?w=400&h=200&fit=crop',
    action: 'Dołącz',
  },
]

// Mapping JPT_KOD_JE codes to Powiat names in Małopolska
const getPowiatName = (code) => {
  if (!code) return 'Małopolska';
  const prefix = code.substring(0, 4);
  switch (prefix) {
    case '1201': return 'Powiat bocheński';
    case '1203': return 'Powiat chrzanowski';
    case '1204': return 'Powiat dąbrowski';
    case '1206': return 'Powiat krakowski';
    case '1207': return 'Powiat limanowski';
    case '1208': return 'Powiat miechowski';
    case '1209': return 'Powiat myślenicki';
    case '1210': return 'Powiat nowosądecki';
    case '1211': return 'Powiat nowotarski';
    case '1212': return 'Powiat olkuski';
    case '1213': return 'Powiat oświęcimski';
    case '1215': return 'Powiat suski';
    case '1216': return 'Powiat tarnowski';
    case '1217': return 'Powiat tatrzański';
    case '1218': return 'Powiat wadowicki';
    case '1219': return 'Powiat wielicki';
    case '1262': return 'Miasto Nowy Sącz';
    default: return 'Małopolska';
  }
}

// Create custom leaflet marker using Lucide SVGs styled with Tailwind CSS
const createCustomMarker = (type) => {
  const iconColor = type === 'landmark' ? '#1B4332' : '#F97316'; // forest or warm-orange
  const svgContent = type === 'landmark'
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95" style="background-color: ${iconColor};">
        ${svgContent}
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full opacity-35 animate-pulse-soft" style="background-color: ${iconColor};"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Map controller to handle flyTo zoom and bounds fit
function MapController({ bounds, center }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: true, duration: 0.8 });
    } else if (center) {
      map.setView(center, 12, { animate: true, duration: 0.8 });
    }
  }, [bounds, center, map]);

  return null;
}

// Map events subcomponent to track zoom level and store the map instance
function MapEvents({ setMap }) {
  const map = useMapEvents({
    zoomend: () => {
      const zoom = map.getZoom();
      const container = map.getContainer();
      if (zoom < 11) {
        container.classList.add('zoom-low');
      } else {
        container.classList.remove('zoom-low');
      }
    }
  });

  useEffect(() => {
    setMap(map);
    const zoom = map.getZoom();
    const container = map.getContainer();
    if (zoom < 11) {
      container.classList.add('zoom-low');
    } else {
      container.classList.remove('zoom-low');
    }
  }, [map, setMap]);

  return null;
}

function MapPage() {
  const [map, setMap] = useState(null)
  const [mapLayer, setMapLayer] = useState('default')
  
  // Data loading state
  const [gminyGeoJson, setGminyGeoJson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // Selection states
  const [selectedGmina, setSelectedGmina] = useState(null)
  const [selectedPin, setSelectedPin] = useState(null)
  
  // Navigation trigger states
  const [mapCenter, setMapCenter] = useState(TYMBARK_COORDS)
  const [mapBounds, setMapBounds] = useState(null)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])

  // Load municipalities GeoJSON
  useEffect(() => {
    fetch('/gminy-wgs84.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load gminy.json');
        }
        return response.json();
      })
      .then(data => {
        setGminyGeoJson(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching gminy data:', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  // Handle Search Input Filtering
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 1 && gminyGeoJson) {
      const filtered = gminyGeoJson.features
        .filter(f => f.properties.JPT_NAZWA_.toLowerCase().includes(value.toLowerCase()))
        .map(f => f)
        .slice(0, 5); // limit suggestions to 5
      setSearchSuggestions(filtered);
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSuggestionClick = (feature) => {
    setSearchQuery('');
    setSearchSuggestions([]);
    
    setSelectedPin(null);
    setSelectedGmina(feature);
    
    // Zoom to clicked gmina bounds
    if (map) {
      const tempLayer = L.geoJSON(feature);
      const bounds = tempLayer.getBounds();
      setMapBounds(bounds);
    }
  };

  // Styles for Gminy features (borders + fill)
  const geoJsonStyle = (feature) => {
    const isSelected = selectedGmina && selectedGmina.properties.JPT_NAZWA_ === feature.properties.JPT_NAZWA_;
    const isSatellite = mapLayer === 'satellite';
    
    if (isSelected) {
      return {
        fillColor: isSatellite ? '#10B981' : '#52B788', // Brighter emerald on satellite imagery
        fillOpacity: 0.35,
        color: isSatellite ? '#34D399' : '#1B4332', // Emerald vs Forest border
        weight: 3.5,
        opacity: 1.0,
      };
    }
    
    return {
      fillColor: isSatellite ? '#047857' : '#2D6A4F',
      fillOpacity: isSatellite ? 0.08 : 0.06,
      color: isSatellite ? '#A7F3D0' : '#1B4332', // Light mint vs Forest border
      weight: 1.2,
      opacity: isSatellite ? 0.5 : 0.35,
      dashArray: '3'
    };
  };

  // Bind interactions and tooltips to each gmina
  const onEachFeature = (feature, layer) => {
    // Tooltip for signing the gmina
    layer.bindTooltip(feature.properties.JPT_NAZWA_, {
      permanent: true,
      direction: 'center',
      className: 'gmina-tooltip'
    });

    layer.on({
      mouseover: (e) => {
        const isSelected = selectedGmina && selectedGmina.properties.JPT_NAZWA_ === feature.properties.JPT_NAZWA_;
        if (!isSelected) {
          e.target.setStyle({
            fillOpacity: mapLayer === 'satellite' ? 0.25 : 0.2,
            weight: 2.2,
            opacity: 0.8
          });
        }
      },
      mouseout: (e) => {
        const isSelected = selectedGmina && selectedGmina.properties.JPT_NAZWA_ === feature.properties.JPT_NAZWA_;
        if (!isSelected) {
          e.target.setStyle(geoJsonStyle(feature));
        }
      },
      click: (e) => {
        setSelectedPin(null);
        setSelectedGmina(feature);
        
        // Zoom/pan map to feature bounds
        const bounds = e.target.getBounds();
        setMapBounds(bounds);
      }
    });
  };

  // Map Tile configurations
  const tileConfig = {
    default: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, GIS User Community'
    }
  };

  return (
    <div className="relative h-[calc(100vh-172px)] overflow-hidden rounded-t-3xl z-10">
      {/* Loading state overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-40 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="text-forest animate-spin" />
          <p className="text-sm font-semibold text-forest">Wczytywanie granic gmin...</p>
        </div>
      )}

      {/* Error state overlay */}
      {error && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center gap-3">
          <p className="text-sm font-medium text-red-500">Wystąpił błąd podczas ładowania mapy gmin.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-forest-mid"
          >
            Odśwież stronę
          </button>
        </div>
      )}

      {/* Top controls - Search & Layer toggle */}
      <div className="absolute top-4 inset-x-4 z-20 flex gap-2 pointer-events-none">
        {/* Search bar inside mobile container */}
        <div className="flex-1 relative pointer-events-auto">
          <div className="flex items-center bg-white/90 backdrop-blur-md rounded-2xl shadow-glass border border-card-border px-3.5 py-2.5">
            <Search size={16} className="text-graphite-light mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Szukaj gminy w regionie..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full text-xs font-medium text-graphite placeholder-graphite-light bg-transparent border-none outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setSearchSuggestions([]); }} 
                className="p-0.5 rounded-full hover:bg-gray-100"
                aria-label="Wyczyść szukanie"
              >
                <X size={14} className="text-graphite-light" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchSuggestions.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-xl border border-card-border overflow-hidden">
              {searchSuggestions.map((f, i) => (
                <button
                  key={f.properties.JPT_KOD_JE || i}
                  onClick={() => handleSuggestionClick(f)}
                  className="w-full text-left px-4 py-3 text-xs font-semibold text-graphite hover:bg-soft-bg border-b border-card-border last:border-none flex items-center justify-between"
                >
                  <span>Gmina {f.properties.JPT_NAZWA_}</span>
                  <span className="text-[10px] font-normal text-graphite-light uppercase tracking-wider">
                    {getPowiatName(f.properties.JPT_KOD_JE)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Toggle Layer Button */}
        <button
          onClick={() => setMapLayer(mapLayer === 'default' ? 'satellite' : 'default')}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-glass flex items-center justify-center border border-card-border hover:bg-white transition-colors pointer-events-auto flex-shrink-0 active:scale-95"
          aria-label="Zmień warstwę mapy"
        >
          <Layers size={18} className="text-forest" />
        </button>
      </div>

      {/* Interactive Map Component */}
      {!loading && !error && (
        <MapContainer
          center={TYMBARK_COORDS}
          zoom={11}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            url={tileConfig[mapLayer].url}
            attribution={tileConfig[mapLayer].attribution}
          />

          {/* Map controller and event listeners */}
          <MapController bounds={mapBounds} center={mapCenter} />
          <MapEvents setMap={setMap} />

          {/* Gminy Borders layer */}
          {gminyGeoJson && (
            <GeoJSON
              key={`${mapLayer}-${selectedGmina ? selectedGmina.properties.JPT_NAZWA_ : 'none'}`}
              data={gminyGeoJson}
              style={geoJsonStyle}
              onEachFeature={onEachFeature}
            />
          )}

          {/* Landmarks / Events markers */}
          {mockPins.map(pin => (
            <Marker
              key={pin.id}
              position={pin.coords}
              icon={createCustomMarker(pin.type)}
              eventHandlers={{
                click: () => {
                  setSelectedGmina(null);
                  setSelectedPin(pin);
                  
                  // Pan map to pin center
                  setMapBounds(null);
                  setMapCenter(pin.coords);
                }
              }}
            />
          ))}
        </MapContainer>
      )}

      {/* Floating Center Tymbark Compass Button */}
      {!loading && (
        <button
          onClick={() => {
            setSelectedGmina(null);
            setSelectedPin(null);
            setMapBounds(null);
            setMapCenter(TYMBARK_COORDS);
            if (map) {
              map.setView(TYMBARK_COORDS, 11, { animate: true, duration: 0.8 });
            }
          }}
          className="absolute right-4 bottom-6 z-20 w-10 h-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-glass flex items-center justify-center border border-card-border hover:bg-white active:scale-95 transition-transform"
          title="Centruj na Tymbark"
        >
          <Compass size={18} className="text-forest animate-pulse-soft" />
        </button>
      )}

      {/* Bottom panel - Gmina details */}
      {selectedGmina && (
        <div className="absolute bottom-0 inset-x-0 z-30 animate-slide-up">
          <div className="bg-white rounded-t-4xl shadow-2xl overflow-hidden border-t border-card-border">
            {/* Grab bar */}
            <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto my-3" />
            
            {/* Content */}
            <div className="px-5 pb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold text-graphite leading-tight">
                    Gmina {selectedGmina.properties.JPT_NAZWA_}
                  </h3>
                  <p className="text-xs font-semibold text-forest uppercase tracking-wider">
                    {getPowiatName(selectedGmina.properties.JPT_KOD_JE)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGmina(null)}
                  className="w-7 h-7 bg-soft-bg rounded-full flex items-center justify-center active:scale-95"
                  aria-label="Zamknij"
                >
                  <X size={14} className="text-graphite-light" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3.5 mb-4">
                <div className="bg-soft-bg rounded-2xl p-3 border border-card-border">
                  <span className="text-[10px] font-medium text-graphite-light uppercase tracking-wider block mb-0.5">Województwo</span>
                  <span className="text-xs font-bold text-graphite leading-tight">Małopolskie</span>
                </div>
                <div className="bg-soft-bg rounded-2xl p-3 border border-card-border">
                  <span className="text-[10px] font-medium text-graphite-light uppercase tracking-wider block mb-0.5">Powierzchnia</span>
                  <span className="text-xs font-bold text-graphite leading-tight">
                    {(parseFloat(selectedGmina.properties.JPT_POWIER) / 100).toFixed(2)} km²
                  </span>
                </div>
              </div>

              <p className="text-xs text-graphite-light leading-relaxed mb-4">
                Malowniczy region położony w województwie małopolskim. Posiada unikalne walory przyrodnicze, krajobrazowe oraz bogate dziedzictwo historyczne i turystyczne.
              </p>

              <button 
                onClick={() => {
                  alert(`Odkrywanie atrakcji w Gminie ${selectedGmina.properties.JPT_NAZWA_}`);
                }}
                className="w-full py-3.5 gradient-primary text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity active:scale-[0.98]"
              >
                <Compass size={14} />
                Odkryj lokalne atrakcje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom panel - Landmark/Event Pin details */}
      {selectedPin && (
        <div className="absolute bottom-0 inset-x-0 z-30 animate-slide-up">
          <div className="bg-white rounded-t-4xl shadow-2xl overflow-hidden border-t border-card-border">
            {/* Image header */}
            <div className="relative h-36">
              <img
                src={selectedPin.image}
                alt={selectedPin.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPin(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center active:scale-95"
                aria-label="Zamknij"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5 ${
                selectedPin.type === 'landmark' ? 'bg-forest/10 text-forest' : 'bg-warm-orange/10 text-warm-orange'
              }`}>
                {selectedPin.type === 'landmark' ? 'Miejsce warte uwagi' : 'Wydarzenie'}
              </span>
              <h3 className="text-base font-bold text-graphite mb-1.5 leading-tight">
                {selectedPin.title}
              </h3>
              <p className="text-xs text-graphite-light leading-relaxed mb-4">
                {selectedPin.description}
              </p>

              <button 
                onClick={() => {
                  alert(`${selectedPin.action} - ${selectedPin.title}`);
                }}
                className="w-full py-3.5 gradient-primary text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity active:scale-[0.98]"
              >
                {selectedPin.action === 'Nawiguj' ? <Navigation size={14} /> : <Users size={14} />}
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
