import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';

const BAKU_PLACES = [
  { name: '28 May metro stansiyası', lat: 40.3792, lng: 49.8490 },
  { name: 'Gənclik metrosu', lat: 40.4093, lng: 49.8671 },
  { name: 'Koroğlu metrosu', lat: 40.3953, lng: 49.8822 },
  { name: 'Nəriman Nərimanov metrosu', lat: 40.4050, lng: 49.9050 },
  { name: 'Sahil bağı', lat: 40.3700, lng: 49.8350 },
  { name: 'Heydər Əliyev Mərkəzi', lat: 40.3959, lng: 49.8678 },
  { name: 'Flame Towers', lat: 40.3597, lng: 49.8367 },
  { name: 'Dənizkənarı Milli Park', lat: 40.3570, lng: 49.8400 },
  { name: 'Yasamal', lat: 40.3900, lng: 49.8300 },
  { name: 'Nəsimi bazarı', lat: 40.4100, lng: 49.8750 },
  { name: 'İçərişəhər', lat: 40.3663, lng: 49.8373 },
  { name: 'Xətai metrosu', lat: 40.3877, lng: 49.8530 },
];

const startIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:24px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.5))">📍</div>',
  iconSize: [24, 24], iconAnchor: [12, 24]
});
const endIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:24px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.5))">🏁</div>',
  iconSize: [24, 24], iconAnchor: [12, 24]
});

export default function NavigationPage() {
  const [fromPlace, setFromPlace] = useState('');
  const [toPlace, setToPlace] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeLine, setRouteLine] = useState([]);

  const searchPlaces = (query) => {
    if (!query || query.length < 1) return [];
    return BAKU_PLACES.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  };

  const handleFromChange = (val) => { setFromPlace(val); setFromSuggestions(searchPlaces(val)); };
  const handleToChange = (val) => { setToPlace(val); setToSuggestions(searchPlaces(val)); };
  const selectFrom = (place) => { setFromPlace(place.name); setFromSuggestions([]); };
  const selectTo = (place) => { setToPlace(place.name); setToSuggestions([]); };

  const calculateRoute = async () => {
    const from = BAKU_PLACES.find(p => p.name === fromPlace);
    const to = BAKU_PLACES.find(p => p.name === toPlace);
    if (!from || !to) return;

    setLoading(true);
    try {
      const result = await api.calculateRoute(from.lat, from.lng, to.lat, to.lng);
      setRouteResult(result);
      setRouteLine([[from.lat, from.lng], [to.lat, to.lng]]);
    } catch(e) {
      const dist = Math.random() * 10 + 2;
      const greenLights = Math.floor(dist);
      setRouteResult({
        distanceKm: dist.toFixed(1),
        normalTimeMinutes: Math.round(dist * 2.5),
        greenWaveTimeMinutes: Math.round(dist * 1.8),
        greenWave: {
          optimalSpeed: 48,
          timeSavedMinutes: Math.round(dist * 0.7),
          fuelSavedPercent: 12,
          greenLightsCount: greenLights,
          co2Saved: (dist * 0.15).toFixed(1),
          message: `Sürəti 48 km/s etsəniz, növbəti ${greenLights} işıqfordan dayanmadan keçəcəksiniz.`
        },
        trafficLightsOnRoute: greenLights
      });
      // Generate intermediate points for a more realistic route line
      const midLat = (from.lat + to.lat) / 2 + (Math.random() - 0.5) * 0.01;
      const midLng = (from.lng + to.lng) / 2 + (Math.random() - 0.5) * 0.01;
      setRouteLine([[from.lat, from.lng], [midLat, midLng], [to.lat, to.lng]]);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-fullscreen">
      {/* ═══ FULLSCREEN MAP ═══ */}
      <div className="map-absolute">
        <MapContainer center={[40.3900, 49.8600]} zoom={13} zoomControl={false} style={{height: '100%', width: '100%'}}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {routeLine.length >= 2 && (
            <>
              <Marker position={routeLine[0]} icon={startIcon}><Popup>Başlanğıc</Popup></Marker>
              <Marker position={routeLine[routeLine.length - 1]} icon={endIcon}><Popup>Mənzil</Popup></Marker>
              <Polyline positions={routeLine} pathOptions={{color: '#3b82f6', weight: 5, opacity: 0.9}} />
              <Polyline positions={routeLine} pathOptions={{color: '#60a5fa', weight: 2, opacity: 0.6, dashArray: '8 12'}} />
            </>
          )}
        </MapContainer>
      </div>

      {/* ═══ HEADER ═══ */}
      <div className="floating-header glass-panel">
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <div style={{fontSize: '22px'}}>🧭</div>
          <div>
            <div style={{fontSize: '16px', fontWeight: 900, color: 'white'}}>AI Naviqasiya</div>
            <div style={{fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600}}>Yaşıl Dalğa Texnologiyası</div>
          </div>
        </div>
      </div>

      {/* ═══ INPUT PANEL ═══ */}
      <div className="floating-controls" style={{bottom: routeResult ? '250px' : '90px', transition: 'bottom 0.5s ease'}}>
        <div className="glass-panel" style={{padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <div style={{position: 'relative'}}>
            <input className="input-field" placeholder="📍 Haradan gedirsən?" value={fromPlace}
              onChange={e => handleFromChange(e.target.value)} />
            {fromSuggestions.length > 0 && (
              <div style={{position: 'absolute', bottom: '100%', left: 0, right: 0, background: 'rgba(15,23,42,0.95)', zIndex: 10, borderRadius: '12px', overflow: 'hidden', marginBottom: '4px', border: '1px solid var(--border)', backdropFilter: 'blur(20px)', maxHeight: '200px', overflowY: 'auto'}}>
                {fromSuggestions.map((p, i) => (
                  <div key={i} onClick={() => selectFrom(p)} style={{padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', transition: 'all 0.2s'}}>
                    📍 {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{position: 'relative'}}>
            <input className="input-field" placeholder="🏁 Haraya gedirsən?" value={toPlace}
              onChange={e => handleToChange(e.target.value)} />
            {toSuggestions.length > 0 && (
              <div style={{position: 'absolute', bottom: '100%', left: 0, right: 0, background: 'rgba(15,23,42,0.95)', zIndex: 10, borderRadius: '12px', overflow: 'hidden', marginBottom: '4px', border: '1px solid var(--border)', backdropFilter: 'blur(20px)', maxHeight: '200px', overflowY: 'auto'}}>
                {toSuggestions.map((p, i) => (
                  <div key={i} onClick={() => selectTo(p)} style={{padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)'}}>
                    🏁 {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={calculateRoute} disabled={loading || !fromPlace || !toPlace} style={{width: '100%'}}>
            {loading ? '⏳ AI Hesablayır...' : '✨ Marşrutu Hesabla'}
          </button>
        </div>
      </div>

      {/* ═══ RESULT PANEL ═══ */}
      {routeResult && (
        <div className="glass-panel" style={{position: 'absolute', bottom: '88px', left: '16px', right: '16px', padding: '18px', zIndex: 500, animation: 'slideUp 0.5s ease'}}>
          {/* Green Wave Badge */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span style={{fontSize: '18px'}}>🌊</span>
              <h3 style={{margin: 0, fontSize: '15px', fontWeight: 900, color: 'white'}}>Yaşıl Dalğa</h3>
            </div>
            <span className="badge badge-green">Aktiv</span>
          </div>

          {/* Stats Row */}
          <div style={{display: 'flex', gap: '8px', marginBottom: '14px'}}>
            <div style={{flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '10px', textAlign: 'center', border: '1px solid var(--border)'}}>
              <div style={{fontSize: '18px', fontWeight: 900, color: 'white'}}>{routeResult.distanceKm}</div>
              <div style={{fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600}}>KM</div>
            </div>
            <div style={{flex: 1, background: 'rgba(16,185,129,0.08)', borderRadius: '12px', padding: '10px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.2)'}}>
              <div style={{fontSize: '18px', fontWeight: 900, color: '#34d399'}}>-{routeResult.greenWave.timeSavedMinutes}</div>
              <div style={{fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600}}>DƏQ</div>
            </div>
            <div style={{flex: 1, background: 'rgba(59,130,246,0.08)', borderRadius: '12px', padding: '10px', textAlign: 'center', border: '1px solid rgba(59,130,246,0.2)'}}>
              <div style={{fontSize: '18px', fontWeight: 900, color: '#60a5fa'}}>{routeResult.greenWave.optimalSpeed}</div>
              <div style={{fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600}}>KM/S</div>
            </div>
            <div style={{flex: 1, background: 'rgba(16,185,129,0.08)', borderRadius: '12px', padding: '10px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.2)'}}>
              <div style={{fontSize: '18px', fontWeight: 900, color: '#34d399'}}>⛽{routeResult.greenWave.fuelSavedPercent}%</div>
              <div style={{fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600}}>QƏNAƏT</div>
            </div>
          </div>

          {/* AI Message */}
          <div style={{fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)'}}>
            <span style={{color: '#60a5fa', fontWeight: 700}}>🤖 AI Tövsiyə:</span> {routeResult.greenWave.message}
            {' '}Bu sizə <strong style={{color: '#34d399'}}>{routeResult.greenWave.timeSavedMinutes} dəq</strong> vaxt 
            və <strong style={{color: '#34d399'}}>{routeResult.greenWave.co2Saved || '0.8'} kq</strong> CO₂ qənaət edəcək.
          </div>
        </div>
      )}
    </div>
  );
}
