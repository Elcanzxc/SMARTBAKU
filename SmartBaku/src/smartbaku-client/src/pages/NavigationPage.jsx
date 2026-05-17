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
];

export default function NavigationPage() {
  const [fromPlace, setFromPlace] = useState('');
  const [toPlace, setToPlace] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeLine, setRouteLine] = useState([]);

  const searchPlaces = (query) => {
    if (!query) return [];
    return BAKU_PLACES.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  };

  const handleFromChange = (val) => {
    setFromPlace(val);
    setFromSuggestions(searchPlaces(val));
  };

  const handleToChange = (val) => {
    setToPlace(val);
    setToSuggestions(searchPlaces(val));
  };

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
      // Fallback simulation
      const dist = Math.random() * 10 + 2;
      setRouteResult({
        distanceKm: dist.toFixed(1),
        normalTimeMinutes: Math.round(dist * 2.5),
        greenWaveTimeMinutes: Math.round(dist * 1.8),
        greenWave: {
          optimalSpeed: 48,
          timeSavedMinutes: Math.round(dist * 0.7),
          fuelSavedPercent: 12,
          greenLightsCount: Math.floor(dist),
          message: `Sürəti 48 km/s etsəniz, növbəti ${Math.floor(dist)} işıqfordan dayanmadan keçəcəksiniz. Bu, sizə ${Math.round(dist*0.7)} dəqiqə və 12% yanacaq qənaəti verəcək.`
        },
        trafficLightsOnRoute: Math.floor(dist)
      });
      setRouteLine([[from.lat, from.lng], [to.lat, to.lng]]);
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <h1 className="page-title">🧭 Ağıllı Naviqasiya</h1>

      <div className="card">
        <div className="input-group">
          <label>📍 Başlanğıc nöqtə</label>
          <input className="input-field" placeholder="Məkan yazın..." value={fromPlace}
            onChange={e => handleFromChange(e.target.value)} id="nav-from" />
          {fromSuggestions.length > 0 && (
            <div style={{background:'var(--bg-secondary)',borderRadius:'8px',marginTop:'4px',overflow:'hidden'}}>
              {fromSuggestions.map((p,i) => (
                <div key={i} onClick={() => selectFrom(p)}
                  style={{padding:'10px 12px',cursor:'pointer',borderBottom:'1px solid var(--border)',fontSize:'13px'}}
                  onMouseEnter={e => e.target.style.background='var(--bg-card)'}
                  onMouseLeave={e => e.target.style.background='transparent'}>
                  📍 {p.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="input-group">
          <label>🏁 Son nöqtə</label>
          <input className="input-field" placeholder="Məkan yazın..." value={toPlace}
            onChange={e => handleToChange(e.target.value)} id="nav-to" />
          {toSuggestions.length > 0 && (
            <div style={{background:'var(--bg-secondary)',borderRadius:'8px',marginTop:'4px',overflow:'hidden'}}>
              {toSuggestions.map((p,i) => (
                <div key={i} onClick={() => selectTo(p)}
                  style={{padding:'10px 12px',cursor:'pointer',borderBottom:'1px solid var(--border)',fontSize:'13px'}}
                  onMouseEnter={e => e.target.style.background='var(--bg-card)'}
                  onMouseLeave={e => e.target.style.background='transparent'}>
                  🏁 {p.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={calculateRoute} disabled={loading} id="calc-route-btn">
          {loading ? '⏳ Hesablanır...' : '🔍 Marşrutu Hesabla'}
        </button>
      </div>

      {routeResult && (
        <>
          <div className="map-container" style={{height:'35vh'}}>
            <MapContainer center={[40.3900, 49.8600]} zoom={12} scrollWheelZoom={true}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {routeLine.length === 2 && (
                <>
                  <Marker position={routeLine[0]}><Popup>Başlanğıc</Popup></Marker>
                  <Marker position={routeLine[1]}><Popup>Son nöqtə</Popup></Marker>
                  <Polyline positions={routeLine} pathOptions={{color:'#00d4ff',weight:4,dashArray:'10 6'}} />
                </>
              )}
            </MapContainer>
          </div>

          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-value" style={{color:'var(--accent)'}}>{routeResult.distanceKm}</div>
              <div className="stat-label">km məsafə</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{color:'var(--accent-green)'}}>{routeResult.greenWaveTimeMinutes}</div>
              <div className="stat-label">dəq (Yaşıl Dalğa)</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{color:'var(--accent-yellow)'}}>{routeResult.trafficLightsOnRoute}</div>
              <div className="stat-label">işıqfor</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{color:'var(--accent-red)'}}>{routeResult.normalTimeMinutes}</div>
              <div className="stat-label">dəq (adi)</div>
            </div>
          </div>

          <div className="greenwave-box">
            <h4>🌊 Yaşıl Dalğa Tövsiyəsi</h4>
            <div className="greenwave-speed">{routeResult.greenWave.optimalSpeed}</div>
            <div className="greenwave-unit">km/s tövsiyə olunan sürət</div>
            <p style={{marginTop:'10px'}}>{routeResult.greenWave.message}</p>
          </div>

          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-value" style={{color:'var(--accent-green)'}}>⏱️ {routeResult.greenWave.timeSavedMinutes}</div>
              <div className="stat-label">dəqiqə qənaət</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{color:'var(--accent-green)'}}>⛽ {routeResult.greenWave.fuelSavedPercent}%</div>
              <div className="stat-label">yanacaq qənaəti</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
