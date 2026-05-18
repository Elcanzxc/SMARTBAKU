import { useState, useEffect } from 'react';
import { api } from '../services/api';

const DRIVER_RECENT_RULES = [
  { id: 1, streetName: 'Ziya Bünyadov prospekti', description: 'Təmir işlərinə görə sürət həddi 80-dən 60 km/s-ə endirildi. Sağ zolaq bağlıdır.', speedLimit: 60, previousSpeedLimit: 80, isTemporary: true, reason: 'Yol təmiri', radarActive: true, daysAgo: 2 },
  { id: 2, streetName: 'Heydər Əliyev prospekti', description: 'Yeni avtobus zolağı istifadəyə verildi — sağ zolağa giriş qadağandır (06:00–22:00).', speedLimit: 80, previousSpeedLimit: 80, isTemporary: false, reason: 'Yeni zolaq', radarActive: false, daysAgo: 3 },
  { id: 3, streetName: 'Xətai prospekti', description: 'Gecə saatlarında (23:00-06:00) sürət həddi artırılıb: 60→70 km/s.', speedLimit: 70, previousSpeedLimit: 60, isTemporary: true, reason: 'Gecə rejimi', radarActive: false, daysAgo: 5 },
  { id: 8, streetName: 'Bakıxanov küçəsi', description: 'Məktəb zonasında sürət həddi 30 km/s olaraq müəyyən edildi.', speedLimit: 30, previousSpeedLimit: 50, isTemporary: false, reason: 'Məktəb zonası', radarActive: true, daysAgo: 1 },
];

const DRIVER_LOCATION_RULES = [
  { id: 4, streetName: 'Neftçilər prospekti', description: 'Bu ərazidə yol kənarında parkinq tam qadağandır. Radar nəzarəti aktiv.', speedLimit: 60, previousSpeedLimit: 60, isTemporary: false, reason: 'Parkinq qadağası', radarActive: true },
  { id: 5, streetName: 'Tbilisi prospekti', description: 'Növbəti kəsişmədə sağa dönmək qadağandır — yalnız düz və sola.', speedLimit: 70, previousSpeedLimit: 70, isTemporary: false, reason: 'Dönmə qadağası', radarActive: false },
  { id: 9, streetName: 'Nizami küçəsi (Fountain Square)', description: 'Piyada zonasına daxil olmaq qadağandır, yalnız taksilər icazəlidir.', speedLimit: 20, previousSpeedLimit: 20, isTemporary: false, reason: 'Zolaq məhdudiyyəti', radarActive: false },
  { id: 10, streetName: 'Hüseyn Cavid prospekti', description: 'Sol zolaq yalnız ictimai nəqliyyat üçündür.', speedLimit: 50, previousSpeedLimit: 50, isTemporary: false, reason: 'Zolaq məhdudiyyəti', radarActive: true },
  { id: 11, streetName: 'Əhmədli dairəsi', description: 'Girişdə radar — 50 km/s-dən artıq sürət cərimələnir.', speedLimit: 50, previousSpeedLimit: 60, isTemporary: false, reason: 'Parkinq qadağası', radarActive: true },
];

const PEDESTRIAN_RULES = [
  { id: 6, streetName: 'Nizami küçəsi', description: 'Yalnız piyadalar üçün nəzərdə tutulmuş zona. Nəqliyyat girişi qadağandır.', reason: 'Piyada zonası', isTemporary: false },
  { id: 7, streetName: 'Sahil bağı', description: 'Velosiped və elektrikli skuterlərin piyada zolağına daxil olması qadağandır.', reason: 'Təhlükəsizlik', isTemporary: false },
  { id: 12, streetName: '28 May küçəsi', description: 'Təmir səbəbindən piyada keçidi 50 metr irəli çəkilib. Müvəqqəti yönləndirmə işarələrinə əməl edin.', reason: 'Yol təmiri', isTemporary: true },
  { id: 13, streetName: 'Gənclik metrosu ətrafı', description: 'Yeraltı keçiddən istifadə məcburidir — üst keçid bağlanıb.', reason: 'Təhlükəsizlik', isTemporary: true },
  { id: 14, streetName: 'Dənizkənarı Milli Park', description: 'Yeni velosiped yolu açılıb — piyadalar xəttə girməsin.', reason: 'Yeni zolaq', isTemporary: false },
  { id: 15, streetName: 'Koroğlu metrosu', description: 'Piyada keçidində yeni ağıllı svetofor quraşdırılıb.', reason: 'Ağıllı keçid', isTemporary: false },
];

const SAFETY_TIPS_DRIVER = [
  '🚗 Yağışlı havada sürəti 20% azaldın',
  '🔦 Tuneldə fənərləri yandırmağı unutmayın',
  '📱 Sürərkən telefon istifadə etmək qadağandır (Cərimə: 100 AZN)',
  '🚑 Təcili yardım səsinə eşidəndə sağa çəkin',
  '🅿️ Parkinq qadağası olan yerdə dayanma cəriməsi: 40 AZN',
];

const SAFETY_TIPS_PEDESTRIAN = [
  '🚶 Yalnız piyada keçidindən keçin',
  '👀 Keçiddə əvvəlcə sola, sonra sağa baxın',
  '🌙 Gecə vaxtı parlaq rəngli geyim geyinin',
  '📱 Keçiddə telefondan istifadə etməyin',
  '⛔ Qırmızı işıqda keçid cəriməsi: 20 AZN',
];

export default function RulesPage({ role }) {
  const [rules, setRules] = useState(null);
  const [activeTab, setActiveTab] = useState('recent');
  const [sirenActive, setSirenActive] = useState(false);
  const [sirenStage, setSirenStage] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const tips = role === 'driver' ? SAFETY_TIPS_DRIVER : SAFETY_TIPS_PEDESTRIAN;

  useEffect(() => {
    loadRules();
    const tipInterval = setInterval(() => setCurrentTip(t => (t + 1) % tips.length), 5000);
    return () => clearInterval(tipInterval);
  }, [role]);

  async function loadRules() {
    try {
      const r = await api.getRules(role);
      setRules(r);
    } catch(e) {
      if (role === 'driver') {
        setRules({ recent: DRIVER_RECENT_RULES, location: DRIVER_LOCATION_RULES });
      } else {
        setRules({ pedestrian: PEDESTRIAN_RULES });
      }
    }
  }

  const startSirenSimulation = () => {
    setSirenActive(true); setSirenStage(0);
    setTimeout(() => setSirenStage(1), 2000);
    setTimeout(() => setSirenStage(2), 4000);
    setTimeout(() => setSirenStage(3), 7000);
    setTimeout(() => { setSirenActive(false); setSirenStage(0); }, 9000);
  };

  const sirenMessages = [
    '🚑 500m arxada Təcili Yardım aşkarlandı!',
    '🚨 300m! Sağ zolağa keçin!',
    '⚡ 100m! Təcili Yardım çox yaxındır!',
    '✅ Təcili yardım keçdi. Təşəkkür edirik!'
  ];

  const getIcon = (reason) => {
    const map = {
      'Yol təmiri': '🚧', 'Hava şəraiti': '🌧️', 'Qəza': '💥',
      'Məktəb zonası': '🏫', 'Gecə rejimi': '🌙', 'Yeni zolaq': '🚌',
      'Parkinq qadağası': '🅿️', 'Dönmə qadağası': '↪️', 'Piyada zonası': '🚶',
      'Təhlükəsizlik': '🛡️', 'Zolaq məhdudiyyəti': '🚧', 'Ağıllı keçid': '🚦'
    };
    return map[reason] || '📌';
  };

  const filterRules = (rulesList) => {
    if (!searchQuery) return rulesList;
    const q = searchQuery.toLowerCase();
    return rulesList.filter(r => r.streetName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  };

  const renderRuleCard = (rule, idx) => (
    <div className="card rule-card" key={rule.id} style={{animationDelay:`${idx * 0.05}s`, animation:'slideUp 0.4s ease both'}}>
      <div className="rule-icon">{getIcon(rule.reason)}</div>
      <div className="rule-content">
        <h4>{rule.streetName}</h4>
        <p>{rule.description}</p>
        <div className="rule-badges">
          {rule.speedLimit > 0 && rule.speedLimit !== rule.previousSpeedLimit && (
            <span className="rule-badge new">{rule.previousSpeedLimit} → {rule.speedLimit} km/s</span>
          )}
          {rule.isTemporary && <span className="rule-badge temp">Müvəqqəti</span>}
          {!rule.isTemporary && <span className="rule-badge perm">Daimi</span>}
          {rule.radarActive && <span className="rule-badge radar">📸 Radar</span>}
          {rule.daysAgo && <span className="rule-badge new">🕒 {rule.daysAgo} gün əvvəl</span>}
        </div>
      </div>
    </div>
  );

  const driverRecentCount = rules?.recent?.length || 0;
  const driverLocationCount = rules?.location?.length || 0;

  return (
    <div className="page">
      {/* ═══ HEADER ═══ */}
      <div className="page-header">
        <div>
          <h1 className="page-title">⚠️ Qaydalar</h1>
          <div className="page-subtitle">
            {role === 'driver' ? 'Sürücülər üçün yol qaydaları' : 'Piyadalar üçün təhlükəsizlik qaydaları'}
          </div>
        </div>
        <div className="badge badge-blue">{role === 'driver' ? '🚗' : '🚶'}</div>
      </div>

      {/* ═══ SAFETY TIPS CAROUSEL ═══ */}
      <div className="card" style={{background:'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(59,130,246,0.08))', borderColor:'rgba(6,182,212,0.2)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{fontSize:'28px',flexShrink:0}}>💡</div>
          <div>
            <div style={{fontSize:'10px',fontWeight:700,color:'var(--accent-cyan)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'4px'}}>Günün Məsləhəti</div>
            <div style={{fontSize:'13px',color:'var(--text-secondary)',lineHeight:1.5,transition:'all 0.3s ease'}}>{tips[currentTip]}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'4px',marginTop:'10px',justifyContent:'center'}}>
          {tips.map((_, i) => (
            <div key={i} style={{width: i === currentTip ? '20px' : '6px',height:'4px',borderRadius:'4px',background: i === currentTip ? 'var(--accent-cyan)' : 'var(--border)',transition:'all 0.3s ease'}} />
          ))}
        </div>
      </div>

      {/* ═══ SIREN SIMULATION (Drivers Only) ═══ */}
      {role === 'driver' && (
        <div className="card" style={{textAlign:'center',background:'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(59,130,246,0.06))',borderColor:'rgba(239,68,68,0.15)'}}>
          <div style={{fontSize:'40px',marginBottom:'8px'}}>🚨</div>
          <h3 style={{fontSize:'16px',fontWeight:800,marginBottom:'4px',color:'white'}}>Rəqəmsal Siren Simulyasiyası</h3>
          <p style={{fontSize:'12px',color:'var(--text-secondary)',marginBottom:'14px',lineHeight:1.5}}>
            Təcili yardım yaxınlaşdıqda ekranınızda necə göründüyünü test edin
          </p>
          <button className="btn btn-danger btn-sm" onClick={startSirenSimulation} style={{maxWidth:'240px',margin:'0 auto'}}>
            🔴🔵 Simulyasiyanı Başlat
          </button>
        </div>
      )}

      {sirenActive && (
        <div className="siren-overlay">
          <div className="siren-icon">🚑</div>
          <div className="siren-text">{sirenMessages[sirenStage]}</div>
          {sirenStage < 3 && (
            <div style={{fontSize:'72px',fontWeight:900,color:'white',marginTop:'10px',textShadow:'0 4px 20px rgba(0,0,0,0.5)'}}>
              {sirenStage === 0 ? '500m' : sirenStage === 1 ? '300m' : '100m'}
            </div>
          )}
          {sirenStage === 3 && <div style={{fontSize:'72px'}}>✅</div>}
          <button className="siren-close" onClick={() => { setSirenActive(false); setSirenStage(0); }}>Bağla ✕</button>
        </div>
      )}

      {/* ═══ SEARCH ═══ */}
      <div style={{position:'relative',marginBottom:'16px'}}>
        <input className="input-field" placeholder="🔍 Küçə və ya qayda axtar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
      </div>

      {/* ═══ DRIVER TABS ═══ */}
      {role === 'driver' ? (
        <>
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>
              🕒 Son Dəyişikliklər ({driverRecentCount})
            </button>
            <button className={`tab-btn ${activeTab === 'location' ? 'active' : ''}`} onClick={() => setActiveTab('location')}>
              📍 Ərazi Qaydaları ({driverLocationCount})
            </button>
          </div>

          {activeTab === 'recent' && (
            <>
              <div className="section-title">Son 7 Gündə Dəyişikliklər</div>
              {rules && filterRules(rules.recent || DRIVER_RECENT_RULES).map((r, i) => renderRuleCard(r, i))}
            </>
          )}

          {activeTab === 'location' && (
            <>
              <div className="section-title">Ərazi və Lokal Qaydalar</div>
              {rules && filterRules(rules.location || DRIVER_LOCATION_RULES).map((r, i) => renderRuleCard(r, i))}
            </>
          )}
        </>
      ) : (
        <>
          <div className="section-title">🚶 Piyadalar üçün Qaydalar</div>
          {rules && filterRules(rules.pedestrian || PEDESTRIAN_RULES).map((r, i) => renderRuleCard(r, i))}
        </>
      )}

      {/* ═══ QUICK STATS ═══ */}
      <div style={{marginTop:'20px'}}>
        <div className="section-title">📈 Statistika</div>
        <div className="stat-grid">
          <div className="stat-box">
            <div className="stat-value" style={{color:'var(--accent)'}}>
              {role === 'driver' ? driverRecentCount + driverLocationCount : (rules?.pedestrian || PEDESTRIAN_RULES).length}
            </div>
            <div className="stat-label">Aktiv Qayda</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{color:'var(--accent-red)'}}>{role === 'driver' ? '3' : '0'}</div>
            <div className="stat-label">Radar Nöqtəsi</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{color:'var(--accent-yellow)'}}>{role === 'driver' ? '2' : '2'}</div>
            <div className="stat-label">Müvəqqəti</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{color:'var(--accent-green)'}}>{role === 'driver' ? '7' : '4'}</div>
            <div className="stat-label">Daimi</div>
          </div>
        </div>
      </div>

      {/* ═══ EMERGENCY INFO ═══ */}
      <div className="card" style={{background:'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(245,158,11,0.06))',borderColor:'rgba(239,68,68,0.15)',marginTop:'8px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{fontSize:'28px'}}>☎️</div>
          <div>
            <h4 style={{fontSize:'14px',fontWeight:800,marginBottom:'2px'}}>Təcili Hallar</h4>
            <p style={{fontSize:'12px',color:'var(--text-secondary)'}}>
              Qəza: <strong style={{color:'white'}}>102</strong> • Təcili yardım: <strong style={{color:'white'}}>103</strong> • Yanğın: <strong style={{color:'white'}}>101</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
