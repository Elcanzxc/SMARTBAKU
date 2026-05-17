import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [sirenActive, setSirenActive] = useState(false);
  const [sirenStage, setSirenStage] = useState(0); // 0=500m, 1=300m, 2=100m, 3=passed
  const audioRef = useRef(null);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const r = await api.getRules();
      setRules(r);
    } catch(e) {
      // Fallback rules
      setRules([
        { id:1, streetName:'Ziya Bünyadov prospekti', description:'Təmir işlərinə görə sürət həddi endirildi', speedLimit:60, previousSpeedLimit:80, isTemporary:true, reason:'Yol təmiri', radarActive:true },
        { id:2, streetName:'Neftçilər prospekti', description:'Yağış səbəbilə sürət həddi müvəqqəti azaldılıb', speedLimit:50, previousSpeedLimit:60, isTemporary:true, reason:'Hava şəraiti', radarActive:true },
        { id:3, streetName:'Heydər Əliyev prospekti', description:'Yeni avtobus zolağı. Sağ zolaq yalnız avtobuslar üçündür', speedLimit:80, previousSpeedLimit:80, isTemporary:false, reason:'Yeni qayda', radarActive:false },
        { id:4, streetName:'28 May küçəsi', description:'Məktəb zonası — sürət həddi endirildi', speedLimit:30, previousSpeedLimit:40, isTemporary:false, reason:'Məktəb zonası', radarActive:true },
        { id:5, streetName:'Tbilisi prospekti', description:'Sol zolaqda qəza — yol daraldılıb', speedLimit:40, previousSpeedLimit:70, isTemporary:true, reason:'Qəza', radarActive:false },
      ]);
    }
  }

  const startSirenSimulation = () => {
    setSirenActive(true);
    setSirenStage(0);
    // Play siren sound using Web Audio API
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      playSirenSound(ctx);
    } catch(e) {}
    // Progress through stages
    setTimeout(() => setSirenStage(1), 2000);
    setTimeout(() => setSirenStage(2), 4000);
    setTimeout(() => setSirenStage(3), 7000);
    setTimeout(() => { setSirenActive(false); setSirenStage(0); }, 9000);
  };

  function playSirenSound(ctx) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'sine';
    gain.gain.value = 0.15;
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    // Siren wail effect
    const now = ctx.currentTime;
    for (let i = 0; i < 8; i++) {
      osc1.frequency.setValueAtTime(600, now + i * 1);
      osc1.frequency.linearRampToValueAtTime(900, now + i * 1 + 0.5);
      osc1.frequency.linearRampToValueAtTime(600, now + i * 1 + 1);
    }
    osc2.frequency.value = 0;
    osc1.start(now);
    osc1.stop(now + 8);
  }

  const sirenMessages = [
    '🚑 500 metr arxada Təcili Yardım aşkarlandı!',
    '🚨 300 metr! Diqqət! Sağ zolağa keçin!',
    '⚡ 100 metr! Təcili Yardım çox yaxındır!',
    '✅ Təcili yardım keçdi. Təşəkkür edirik!'
  ];

  return (
    <div className="page">
      <h1 className="page-title">⚠️ Qaydalar Mərkəzi</h1>

      {/* Siren simulation button */}
      <div className="card" style={{textAlign:'center',background:'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(59,130,246,0.1))'}}>
        <div style={{fontSize:'36px',marginBottom:'8px'}}>🚨</div>
        <h3 style={{fontSize:'16px',marginBottom:'6px'}}>Rəqəmsal Siren Simulyasiyası</h3>
        <p style={{fontSize:'12px',color:'var(--text-secondary)',marginBottom:'12px'}}>
          Təcili yardım yaxınlaşdıqda sürücülərin ekranında necə göründüyünü simulyasiya edin
        </p>
        <button className="btn btn-danger" onClick={startSirenSimulation} id="siren-demo-btn">
          🔴🔵 Simulyasiyanı Başlat
        </button>
      </div>

      {/* Siren overlay */}
      {sirenActive && (
        <div className="siren-overlay">
          <div className="siren-icon">🚑</div>
          <div className="siren-text">{sirenMessages[sirenStage]}</div>
          {sirenStage < 3 && (
            <div style={{fontSize:'64px',fontWeight:900,color:'white',marginTop:'8px'}}>
              {sirenStage === 0 ? '500m' : sirenStage === 1 ? '300m' : '100m'}
            </div>
          )}
          {sirenStage === 3 && <div style={{fontSize:'64px'}}>✅</div>}
          <button className="siren-close" onClick={() => { setSirenActive(false); setSirenStage(0); }}>
            Bağla ✕
          </button>
        </div>
      )}

      {/* Active rules list */}
      <h3 style={{fontSize:'15px',fontWeight:600,marginBottom:'10px',marginTop:'8px'}}>📋 Aktiv Qaydalar</h3>
      {rules.map((rule, i) => (
        <div className="card rule-card" key={rule.id || i}>
          <div className="rule-icon">
            {rule.reason === 'Yol təmiri' ? '🚧' :
             rule.reason === 'Hava şəraiti' ? '🌧️' :
             rule.reason === 'Qəza' ? '💥' :
             rule.reason === 'Məktəb zonası' ? '🏫' :
             rule.reason === 'Gecə rejimi' ? '🌙' : '📌'}
          </div>
          <div className="rule-content">
            <h4>{rule.streetName}</h4>
            <p>{rule.description}</p>
            <div style={{display:'flex',gap:'6px',marginTop:'6px',flexWrap:'wrap'}}>
              {rule.speedLimit !== rule.previousSpeedLimit && (
                <span className="rule-badge temp">
                  {rule.previousSpeedLimit} → {rule.speedLimit} km/s
                </span>
              )}
              {rule.isTemporary && <span className="rule-badge temp">Müvəqqəti</span>}
              {!rule.isTemporary && <span className="rule-badge perm">Daimi</span>}
              {rule.radarActive && <span className="rule-badge radar">📸 Radar aktiv</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
