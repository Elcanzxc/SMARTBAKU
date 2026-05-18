import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import { startConnection } from '../services/signalr';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const vehicleIcon = (type) => L.divIcon({
  className: '',
  html: `<div style="font-size:28px; filter:drop-shadow(0 3px 8px rgba(0,0,0,0.6))">${
    type === 'ambulance' ? '🚑' : type === 'bus' ? '🚌' : '🚕'
  }</div>`,
  iconSize: [32, 32], iconAnchor: [16, 16]
});

const lightIcon = (phase) => L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:${phase === 'green' ? '#10b981' : phase === 'yellow' ? '#f59e0b' : '#ef4444'};border:2.5px solid white;box-shadow:0 0 14px ${phase === 'green' ? '#10b981' : phase === 'yellow' ? '#f59e0b' : '#ef4444'}, 0 0 40px ${phase === 'green' ? 'rgba(16,185,129,0.5)' : phase === 'yellow' ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)'};animation:pulse-light 2s infinite"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8]
});

const crossingIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:26px;filter:drop-shadow(0 0 12px rgba(59,130,246,0.7))">🚸</div>`,
  iconSize: [28, 28], iconAnchor: [14, 14]
});

const parkingIcon = (available) => L.divIcon({
  className: '',
  html: `<div style="background:${available ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)'};color:white;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:800;border:1.5px solid rgba(255,255,255,0.3);box-shadow:0 4px 12px rgba(0,0,0,0.4);white-space:nowrap">🅿️ ${available ? 'Boş' : 'Dolu'}</div>`,
  iconSize: [60, 24], iconAnchor: [30, 12]
});

function UserLocationMarker({ setGlobalPos }) {
  const [pos, setPos] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) {
      const fallback = [40.4093, 49.8671];
      setPos(fallback); setGlobalPos(fallback);
      map.setView(fallback, 14);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const ll = [p.coords.latitude, p.coords.longitude];
        setPos(ll); setGlobalPos(ll); map.setView(ll, map.getZoom());
      },
      () => {
        const ll = [40.4093, 49.8671];
        setPos(ll); setGlobalPos(ll); map.setView(ll, 14);
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [map, setGlobalPos]);

  return pos ? (
    <>
      <Circle center={pos} radius={60} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.12, weight: 1 }} />
      <CircleMarker center={pos} radius={7} pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }}>
        <Popup><strong>📍 Sizin mövqeyiniz</strong></Popup>
      </CircleMarker>
    </>
  ) : null;
}

// ─── Smart parking data ───
const PARKING_SPOTS = [
  { lat: 40.3920, lng: 49.8650, name: 'Gənclik Parkinq', spots: 3, total: 20 },
  { lat: 40.3850, lng: 49.8550, name: '28 May Parkinq', spots: 0, total: 15 },
  { lat: 40.4050, lng: 49.8710, name: 'Nəriman Nərimanov', spots: 7, total: 25 },
  { lat: 40.3700, lng: 49.8370, name: 'Sahil Parkinq', spots: 1, total: 10 },
];

export default function DashboardPage({ role }) {
  const [vehicles, setVehicles] = useState([]);
  const [lights, setLights] = useState([]);
  const [crossings, setCrossings] = useState([]);
  const [congestion, setCongestion] = useState([]);
  const [crossingState, setCrossingState] = useState('idle');
  const [crossingTimer, setCrossingTimer] = useState(0);
  const [userPos, setUserPos] = useState(null);
  const [activeCrosswalks, setActiveCrosswalks] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [mapLayer, setMapLayer] = useState('dark');
  const [hazards, setHazards] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const signalrConn = useRef(null);

  useEffect(() => {
    loadData();
    connectSignalR();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [v, l, cr, co] = await Promise.all([
        api.getVehicles(), api.getTrafficLights(), api.getCrossings(), api.getCongestion()
      ]);
      setVehicles(v); setLights(l); setCrossings(cr); setCongestion(co);
    } catch(e) { console.error('Load:', e); }
  }

  async function connectSignalR() {
    try {
      const conn = await startConnection();
      signalrConn.current = conn;
      conn.on('SimulationUpdate', (data) => {
        if (data.vehicles) setVehicles(data.vehicles);
        if (data.trafficLights) setLights(data.trafficLights);
      });
      conn.on('CrossingRequested', (data) => {
        setActiveCrosswalks(prev => [...prev, { ...data, status: 'waiting' }]);
        if (role === 'pedestrian') { setCrossingState('waiting'); setCrossingTimer(data.waitTime || 5); }
      });
      conn.on('CrossingGranted', (data) => {
        setActiveCrosswalks(prev => prev.map(cw => cw.lat === data.lat && cw.lng === data.lng ? { ...cw, status: 'granted' } : cw));
        if (role === 'pedestrian') { setCrossingState('granted'); if (navigator.vibrate) navigator.vibrate([200, 100, 200]); }
      });
      conn.on('CrossingEnded', (data) => {
        setActiveCrosswalks(prev => prev.filter(cw => cw.lat !== data.lat || cw.lng !== data.lng));
        if (role === 'pedestrian') setCrossingState('idle');
      });
      conn.on('HazardReported', (data) => {
        setHazards(prev => [...prev, data]);
        if (navigator.vibrate) navigator.vibrate(200);
      });
      await conn.invoke('JoinRole', role);
    } catch(e) { console.error('SignalR:', e); }
  }

  const reportHazard = async (type) => {
    if (!userPos || !signalrConn.current) return;
    try {
      await signalrConn.current.invoke('ReportHazard', userPos[0], userPos[1], type);
      setShowReportModal(false);
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    let interval;
    if (crossingState === 'waiting' && crossingTimer > 0) {
      interval = setInterval(() => setCrossingTimer(t => t - 1), 1000);
    }
    if (crossingState === 'waiting' && crossingTimer <= 0) {
      setCrossingState('granted');
      setActiveCrosswalks(prev => prev.map(cw => ({ ...cw, status: 'granted' })));
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setTimeout(() => { setCrossingState('idle'); setActiveCrosswalks([]); }, 12000);
    }
    return () => clearInterval(interval);
  }, [crossingState, crossingTimer]);

  const handleCrossingRequest = async () => {
    if (crossingState !== 'idle' || !userPos) return;
    try {
      if (signalrConn.current) {
        await signalrConn.current.invoke('RequestCrossing', userPos[0], userPos[1]);
      } else {
        setCrossingState('waiting');
        setCrossingTimer(5);
        setActiveCrosswalks(prev => [...prev, { lat: userPos[0], lng: userPos[1], status: 'waiting' }]);
      }
    } catch (e) {
      setCrossingState('waiting');
      setCrossingTimer(5);
      setActiveCrosswalks(prev => [...prev, { lat: userPos[0], lng: userPos[1], status: 'waiting' }]);
    }
  };

  const renderCrosswalkVisuals = (cw, idx) => {
    const { lat, lng, status } = cw;
    const isGranted = status === 'granted';
    const color = isGranted ? '#10b981' : '#ef4444';
    const stripes = [];
    for (let i = -3; i <= 3; i++) {
      stripes.push(
        <Polyline key={`stripe-${idx}-${i}`}
          positions={[[lat + i * 0.00008, lng - 0.00025], [lat + i * 0.00008, lng + 0.00025]]}
          pathOptions={{ color: 'white', weight: 5, opacity: isGranted ? 0.95 : 0.5 }} />
      );
    }
    return (
      <div key={`cw-${idx}`}>
        {stripes}
        <Circle center={[lat, lng]} radius={25} pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 2 }} />
        {/* Traffic light simulation */}
        <Marker position={[lat + 0.0003, lng - 0.0004]} icon={L.divIcon({
          className: '',
          html: `<div style="background:rgba(0,0,0,0.85);border-radius:12px;padding:6px;display:flex;flex-direction:column;gap:4px;align-items:center;border:2px solid rgba(255,255,255,0.2);box-shadow:0 6px 20px rgba(0,0,0,0.6)">
            <div style="width:14px;height:14px;border-radius:50%;background:${!isGranted ? '#ef4444' : '#333'};box-shadow:${!isGranted ? '0 0 12px #ef4444' : 'none'}"></div>
            <div style="width:14px;height:14px;border-radius:50%;background:${isGranted ? 'transparent' : '#f59e0b'};box-shadow:${!isGranted ? '0 0 8px #f59e0b' : 'none'}"></div>
            <div style="width:14px;height:14px;border-radius:50%;background:${isGranted ? '#10b981' : '#333'};box-shadow:${isGranted ? '0 0 12px #10b981' : 'none'}"></div>
          </div>`,
          iconSize: [30, 60], iconAnchor: [15, 30]
        })} />
        {/* Status label */}
        <Marker position={[lat - 0.0003, lng]} icon={L.divIcon({
          className: '',
          html: `<div style="background:${color};color:white;padding:6px 14px;border-radius:10px;font-weight:800;font-size:12px;white-space:nowrap;box-shadow:0 6px 16px rgba(0,0,0,0.5);font-family:Inter,sans-serif;letter-spacing:0.3px;border:1.5px solid rgba(255,255,255,0.2)">${isGranted ? '✅ Keçə bilərsiniz!' : '🛑 Gözləyin...'}</div>`,
          iconSize: [140, 30], iconAnchor: [70, 15]
        })} />
      </div>
    );
  };

  const tiles = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  };

  const greenCount = lights.filter(l => l.currentPhase === 'green').length;
  const redCount = lights.filter(l => l.currentPhase === 'red').length;

  return (
    <div className="dashboard-fullscreen">
      {/* ═══ MAP ═══ */}
      <div className="map-absolute">
        <MapContainer center={[40.4093, 49.8671]} zoom={14} scrollWheelZoom={true} zoomControl={false} style={{height:'100%',width:'100%'}}>
          <TileLayer url={tiles[mapLayer]} />
          <UserLocationMarker setGlobalPos={setUserPos} />

          {vehicles.map(v => (
            <Marker key={`v-${v.id}`} position={[v.lat, v.lng]} icon={vehicleIcon(v.type)}>
              <Popup>
                <div className="ai-popup">
                  <div className="ai-popup-title">{v.type === 'ambulance' ? '🚑 TƏCİLİ YARDIM' : v.type === 'bus' ? '🚌 AVTOBUS' : '🚕 AVTOMOBIL'}</div>
                  <div style={{marginTop:'4px'}}>Sürət: <strong>{Math.round(v.speed)} km/s</strong></div>
                </div>
              </Popup>
            </Marker>
          ))}

          {lights.map(l => (
            <Marker key={`l-${l.id}`} position={[l.lat, l.lng]} icon={lightIcon(l.currentPhase)}>
              <Popup>
                <div className="ai-popup">
                  <div className="ai-popup-title">🤖 AI İŞIQFOR NƏZARƏTİ</div>
                  <strong>{l.intersectionName}</strong>
                  <div style={{marginTop:'4px',fontSize:'12px'}}>{l.aiDecision}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Parking spots for drivers */}
          {role === 'driver' && PARKING_SPOTS.map((p, i) => (
            <Marker key={`park-${i}`} position={[p.lat, p.lng]} icon={parkingIcon(p.spots > 0)}>
              <Popup>
                <div className="ai-popup">
                  <div className="ai-popup-title">🅿️ {p.name}</div>
                  <div style={{marginTop:'4px'}}>{p.spots > 0 ? `${p.spots}/${p.total} boş yer` : 'Yer yoxdur!'}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Pedestrian crossings */}
          {role === 'pedestrian' && crossings.map(c => (
            <Marker key={`c-${c.id}`} position={[c.lat, c.lng]} icon={crossingIcon}>
              <Popup><strong>{c.name}</strong><br/>Ağıllı keçid mövcuddur</Popup>
            </Marker>
          ))}

          {/* Bus Route Visualization (Pedestrian & Driver) */}
          <Polyline 
            positions={[
              [40.3792, 49.8490], [40.3850, 49.8550], [40.3953, 49.8822], [40.4050, 49.8710], [40.4093, 49.8671]
            ]} 
            pathOptions={{color: '#8b5cf6', weight: 4, dashArray: '10, 10', opacity: 0.6}} 
          />
          <Marker position={[40.4050, 49.8710]} icon={L.divIcon({className:'', html:'<div style="font-size:16px;background:#8b5cf6;color:white;padding:2px 6px;border-radius:4px;font-weight:700">65 Nömrəli</div>', iconSize:[80,20]})}/>

          {/* Hazards */}
          {hazards.map((h, i) => (
            <Marker key={`haz-${i}`} position={[h.lat, h.lng]} icon={L.divIcon({
              className: '',
              html: `<div style="font-size:32px;filter:drop-shadow(0 0 15px #ef4444);animation:pulse-light 1.5s infinite">⚠️</div>`,
              iconSize: [32, 32], iconAnchor: [16, 16]
            })}>
              <Popup>
                <div className="ai-popup" style={{color:'#ef4444'}}>
                  <div className="ai-popup-title" style={{color:'#ef4444'}}>DİQQƏT: TƏHLÜKƏ</div>
                  <strong>{h.type}</strong><br/>
                  Sürücülər tərəfindən bildirilib.
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Active crosswalk simulations */}
          {activeCrosswalks.map((cw, idx) => renderCrosswalkVisuals(cw, idx))}
        </MapContainer>
      </div>

      {/* ═══ FLOATING HEADER ═══ */}
      <div className="floating-header glass-panel">
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{fontSize:'22px'}}>🚦</div>
          <div>
            <div style={{fontSize:'16px',fontWeight:900,color:'white',letterSpacing:'-0.3px'}}>SmartBaku</div>
            <div style={{fontSize:'10px',color:'var(--text-secondary)',fontWeight:600}}>AI Trafik İdarəetmə</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <button onClick={() => setMapLayer(m => m === 'dark' ? 'satellite' : m === 'satellite' ? 'light' : 'dark')}
            style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'8px',cursor:'pointer',fontSize:'16px',color:'white'}}>
            {mapLayer === 'dark' ? '🌑' : mapLayer === 'satellite' ? '🛰️' : '☀️'}
          </button>
          <button onClick={() => setShowSidebar(!showSidebar)}
            style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'8px',cursor:'pointer',fontSize:'16px',color:'white'}}>
            📊
          </button>
          <div className="badge badge-blue" style={{padding:'6px 12px'}}>
            {role === 'driver' ? '🚗 Sürücü' : '🚶 Piyada'}
          </div>
        </div>
      </div>

      {/* ═══ WEATHER & AQI WIDGET ═══ */}
      <div className="glass-panel" style={{position:'absolute', top:'88px', left:'16px', padding:'10px 14px', display:'flex', gap:'12px', alignItems:'center', zIndex:500}}>
        <div style={{display:'flex', alignItems:'center', gap:'6px', paddingRight:'12px', borderRight:'1px solid var(--border)'}}>
          <span style={{fontSize:'20px'}}>🌤️</span>
          <div>
            <div style={{fontSize:'12px', fontWeight:800, color:'white'}}>18°C Qismən Buludlu</div>
            <div style={{fontSize:'9px', color:'var(--text-secondary)'}}>Səth: Quru</div>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
          <span style={{fontSize:'20px'}}>🍃</span>
          <div>
            <div style={{fontSize:'12px', fontWeight:800, color:'#34d399'}}>AQI: 42 (Əla)</div>
            <div style={{fontSize:'9px', color:'var(--text-secondary)'}}>Hava çox təmizdir</div>
          </div>
        </div>
      </div>

      {/* ═══ REPORT HAZARD MODAL ═══ */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{fontSize:'16px', fontWeight:800, marginBottom:'16px', color:'white'}}>⚠️ Yolda Təhlükə Bildir</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              <button className="btn btn-outline" style={{borderColor:'#ef4444', color:'#f87171'}} onClick={() => reportHazard('💥 Qəza (Dəhşətli)')}>💥 Qəza</button>
              <button className="btn btn-outline" style={{borderColor:'#f59e0b', color:'#fbbf24'}} onClick={() => reportHazard('🚧 Yol Təmiri / Qazıntı')}>🚧 Yol Təmiri</button>
              <button className="btn btn-outline" style={{borderColor:'#3b82f6', color:'#60a5fa'}} onClick={() => reportHazard('🌧️ Su Basması')}>🌧️ Su Basması</button>
            </div>
            <button className="btn btn-outline" style={{marginTop:'16px', border:'none'}} onClick={() => setShowReportModal(false)}>Ləğv et</button>
          </div>
        </div>
      )}

      {/* ═══ SIDEBAR PANEL ═══ */}
      {showSidebar && (
        <div className="floating-panel-left glass-panel" style={{padding:'16px',animation:'slideIn 0.3s ease'}}>
          <h3 style={{fontSize:'14px',fontWeight:800,marginBottom:'14px',color:'white'}}>📊 Canlı Statistika</h3>
          
          {/* Traffic light stats */}
          <div style={{display:'flex',gap:'8px',marginBottom:'14px'}}>
            <div style={{flex:1,background:'rgba(16,185,129,0.1)',borderRadius:'10px',padding:'10px',textAlign:'center',border:'1px solid rgba(16,185,129,0.2)'}}>
              <div style={{fontSize:'20px',fontWeight:900,color:'#34d399'}}>{greenCount}</div>
              <div style={{fontSize:'10px',color:'var(--text-muted)',fontWeight:600}}>YAŞIL</div>
            </div>
            <div style={{flex:1,background:'rgba(239,68,68,0.1)',borderRadius:'10px',padding:'10px',textAlign:'center',border:'1px solid rgba(239,68,68,0.2)'}}>
              <div style={{fontSize:'20px',fontWeight:900,color:'#f87171'}}>{redCount}</div>
              <div style={{fontSize:'10px',color:'var(--text-muted)',fontWeight:600}}>QIRMIZI</div>
            </div>
            <div style={{flex:1,background:'rgba(59,130,246,0.1)',borderRadius:'10px',padding:'10px',textAlign:'center',border:'1px solid rgba(59,130,246,0.2)'}}>
              <div style={{fontSize:'20px',fontWeight:900,color:'#60a5fa'}}>{vehicles.length}</div>
              <div style={{fontSize:'10px',color:'var(--text-muted)',fontWeight:600}}>NƏQLİYYAT</div>
            </div>
          </div>

          {/* Congestion */}
          <h4 style={{fontSize:'12px',fontWeight:700,marginBottom:'10px',color:'var(--text-secondary)'}}>🔴 Tıxac Xəritəsi</h4>
          {congestion.slice(0, 5).map((c, i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:'12px'}}>
              <span style={{color:'var(--text-secondary)',fontWeight:500}}>{c.name}</span>
              <span className={`badge badge-${c.level === 'critical' ? 'red' : c.level === 'high' ? 'yellow' : 'green'}`} style={{fontSize:'10px',padding:'3px 8px'}}>
                {c.currentSpeed} km/s
              </span>
            </div>
          ))}

          {/* Parking for drivers */}
          {role === 'driver' && (
            <>
              <h4 style={{fontSize:'12px',fontWeight:700,marginTop:'14px',marginBottom:'10px',color:'var(--text-secondary)'}}>🅿️ Parkinq</h4>
              {PARKING_SPOTS.map((p, i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',fontSize:'12px'}}>
                  <span style={{color:'var(--text-secondary)'}}>{p.name}</span>
                  <span style={{fontWeight:800,color: p.spots > 0 ? '#34d399' : '#f87171'}}>{p.spots}/{p.total}</span>
                </div>
              ))}
            </>
          )}

          <button className="btn btn-outline btn-sm" style={{marginTop:'14px'}} onClick={() => setShowSidebar(false)}>Bağla</button>
        </div>
      )}

      {/* ═══ FLOATING CONTROLS ═══ */}
      <div className="floating-controls">
        {/* Driver specific panels */}
        {role === 'driver' && !showSidebar && (
          <div style={{display:'flex', gap:'10px', flexDirection:'column'}}>
            <button className="btn btn-outline" style={{width: '100%', borderColor: 'rgba(239,68,68,0.4)', color: '#f87171', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', padding: '12px'}} onClick={() => setShowReportModal(true)}>
              ⚠️ Yolda Təhlükə Bildir
            </button>
            {congestion.length > 0 && (
              <div className="glass-panel" style={{padding:'14px 16px'}} onClick={() => setShowSidebar(true)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{fontSize:'16px'}}>📊</span>
                    <span style={{fontSize:'13px',fontWeight:700,color:'white'}}>Canlı Trafik</span>
                  </div>
                  <div style={{display:'flex',gap:'6px'}}>
                    {congestion.slice(0,2).map((c,i) => (
                      <span key={i} className={`badge badge-${c.level === 'critical' ? 'red' : c.level === 'high' ? 'yellow' : 'green'}`} style={{fontSize:'10px',padding:'3px 8px'}}>
                        {c.currentSpeed}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pedestrian crossing button */}
        {role === 'pedestrian' && (
          <button
            className={`crossing-btn-massive ${crossingState}`}
            onClick={crossingState === 'idle' ? handleCrossingRequest : undefined}
            disabled={crossingState !== 'idle' || !userPos}
          >
            <div style={{fontSize:'36px',marginBottom:'8px'}}>
              {crossingState === 'idle' ? '🚶‍♂️' : crossingState === 'waiting' ? '⏳' : '✅'}
            </div>
            <div style={{fontWeight:800,fontSize:'18px',letterSpacing:'-0.3px'}}>
              {crossingState === 'idle' && 'Yolu Keçmək Tələb Et'}
              {crossingState === 'waiting' && `Sürücülər saxlayır... ${crossingTimer}s`}
              {crossingState === 'granted' && 'Təhlükəsiz Keçə Bilərsiniz!'}
            </div>
            <div style={{fontSize:'12px',marginTop:'6px',opacity:0.8,fontWeight:500}}>
              {crossingState === 'idle' && 'Piyada keçidini aktivləşdirmək üçün basın'}
              {crossingState === 'granted' && 'İşıqfor yaşıl rəngdədir'}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
