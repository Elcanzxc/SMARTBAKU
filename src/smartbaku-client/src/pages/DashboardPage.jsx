import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import { startConnection } from '../services/signalr';

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const vehicleIcon = (type) => L.divIcon({
  className: '',
  html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">${
    type === 'ambulance' ? '🚑' : type === 'bus' ? '🚌' : '🚗'
  }</div>`,
  iconSize: [28, 28], iconAnchor: [14, 14]
});

const lightIcon = (phase) => L.divIcon({
  className: '',
  html: `<div class="traffic-light-dot ${phase}"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7]
});

const crossingIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:22px">🚸</div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});

function UserLocationMarker() {
  const [pos, setPos] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const latlng = [p.coords.latitude, p.coords.longitude];
        setPos(latlng);
        map.setView(latlng, map.getZoom());
      },
      () => {}, { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [map]);

  return pos ? (
    <Circle center={pos} radius={30} pathOptions={{ color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 0.3 }}>
      <Popup>Sizin məkanınız</Popup>
    </Circle>
  ) : null;
}

export default function DashboardPage({ role }) {
  const [vehicles, setVehicles] = useState([]);
  const [lights, setLights] = useState([]);
  const [crossings, setCrossings] = useState([]);
  const [congestion, setCongestion] = useState([]);
  const [crossingState, setCrossingState] = useState('idle'); // idle | waiting | granted
  const [crossingTimer, setCrossingTimer] = useState(0);

  useEffect(() => {
    loadData();
    connectSignalR();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [v, l, cr, co] = await Promise.all([
        api.getVehicles(), api.getTrafficLights(), api.getCrossings(), api.getCongestion()
      ]);
      setVehicles(v); setLights(l); setCrossings(cr); setCongestion(co);
    } catch(e) { console.error('Load error:', e); }
  }

  async function connectSignalR() {
    try {
      const conn = await startConnection();
      conn.on('SimulationUpdate', (data) => {
        if (data.vehicles) setVehicles(data.vehicles);
        if (data.trafficLights) setLights(data.trafficLights);
      });
      conn.on('CrossingGranted', () => {
        setCrossingState('granted');
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        setTimeout(() => setCrossingState('idle'), 5000);
      });
      await conn.invoke('JoinRole', role);
    } catch(e) { console.error('SignalR error:', e); }
  }

  const handleCrossingRequest = () => {
    setCrossingState('waiting');
    const wait = 10 + Math.floor(Math.random() * 16);
    setCrossingTimer(wait);
    const interval = setInterval(() => {
      setCrossingTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCrossingState('granted');
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          setTimeout(() => setCrossingState('idle'), 5000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="page">
      <div className="header-bar">
        <h1 className="page-title">🚦 SmartBaku</h1>
        <span className="badge badge-blue">{role === 'driver' ? '🚗 Sürücü' : '🚶 Piyada'}</span>
      </div>

      <div className="map-container">
        <MapContainer center={[40.4093, 49.8671]} zoom={13} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <UserLocationMarker />

          {vehicles.map(v => (
            <Marker key={`v-${v.id}`} position={[v.lat, v.lng]} icon={vehicleIcon(v.type)}>
              <Popup>
                <div className="ai-popup">
                  <div className="ai-popup-title">{v.type === 'ambulance' ? '🚑 Təcili Yardım' : v.type === 'bus' ? '🚌 Avtobus' : '🚗 Avtomobil'}</div>
                  Sürət: {v.speed} km/s
                </div>
              </Popup>
            </Marker>
          ))}

          {lights.map(l => (
            <Marker key={`l-${l.id}`} position={[l.lat, l.lng]} icon={lightIcon(l.currentPhase)}>
              <Popup>
                <div className="ai-popup">
                  <div className="ai-popup-title">🤖 Süni İntellekt Qərarı</div>
                  <strong>{l.intersectionName}</strong><br/>
                  {l.aiDecision}
                </div>
              </Popup>
            </Marker>
          ))}

          {role === 'pedestrian' && crossings.map(c => (
            <Marker key={`c-${c.id}`} position={[c.lat, c.lng]} icon={crossingIcon}>
              <Popup><strong>{c.name}</strong><br/>Ağıllı keçid mövcuddur</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Traffic congestion list */}
      {role === 'driver' && congestion.length > 0 && (
        <div className="card">
          <h3 style={{fontSize:'14px',fontWeight:700,marginBottom:'10px'}}>📊 Canlı Tıxac Vəziyyəti</h3>
          {congestion.slice(0,5).map((c, i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'13px'}}>{c.name}</span>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{fontSize:'12px',color:'var(--text-muted)'}}>{c.currentSpeed} km/s</span>
                <span className={`badge badge-${c.level === 'critical' ? 'red' : c.level === 'high' ? 'yellow' : c.level === 'medium' ? 'blue' : 'green'}`}>
                  {c.level === 'critical' ? 'Çox sıx' : c.level === 'high' ? 'Sıx' : c.level === 'medium' ? 'Orta' : 'Sərbəst'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pedestrian crossing button */}
      {role === 'pedestrian' && (
        <div>
          <button
            className={`crossing-btn ${crossingState}`}
            onClick={crossingState === 'idle' ? handleCrossingRequest : undefined}
            disabled={crossingState !== 'idle'}
            id="crossing-request-btn"
          >
            <div className="icon">
              {crossingState === 'idle' ? '🚶' : crossingState === 'waiting' ? '⏳' : '✅'}
            </div>
            {crossingState === 'idle' && 'Keçid Tələb Et'}
            {crossingState === 'waiting' && `Gözləyin... ${crossingTimer}s`}
            {crossingState === 'granted' && 'Keçə bilərsiniz!'}
          </button>
          {crossingState === 'granted' && (
            <p style={{textAlign:'center',color:'var(--accent-green)',fontWeight:600,fontSize:'14px'}}>
              ✅ İşıqfor yaşıl yandı. Təhlükəsiz keçə bilərsiniz!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
