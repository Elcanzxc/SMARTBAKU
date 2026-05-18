import { useState, useEffect } from 'react';
import { api } from '../services/api';

const ACHIEVEMENTS = [
  { icon: '🏆', title: 'Nümunəvi Sürücü', desc: '30 gün arası pozuntusuz', unlocked: true },
  { icon: '🌿', title: 'Eko Qəhrəman', desc: '100+ eko-bal topla', unlocked: true },
  { icon: '🚑', title: 'Xilaskar', desc: '5 dəfə təcili yardıma yol ver', unlocked: false },
  { icon: '🗺️', title: 'Kəşfiyyatçı', desc: '50+ səfər tamamla', unlocked: false },
  { icon: '⭐', title: 'Beşulduzlu', desc: 'Səviyyə 5-ə çat', unlocked: false },
];

const ACHIEVEMENTS_PEDESTRIAN = [
  { icon: '🚶', title: 'Təhlükəsiz Piyada', desc: 'Həmişə keçiddən keç', unlocked: true },
  { icon: '🌿', title: 'Yaşıl Addım', desc: '50+ eko-bal topla', unlocked: true },
  { icon: '📱', title: 'Smart İstifadəçi', desc: 'Ağıllı keçiddən 10 dəfə istifadə et', unlocked: false },
  { icon: '⭐', title: 'Nümunə Vətəndaş', desc: 'Səviyyə 3-ə çat', unlocked: false },
];

export default function ProfilePage({ user: authUser, onLogout }) {
  const role = authUser?.role || 'driver';
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [qrModal, setQrModal] = useState(null);
  const [activeSection, setActiveSection] = useState('stats');

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const [u, s, c] = await Promise.all([api.getUser(), api.getUserStats(), api.getCoupons()]);
      setUser(u); setStats(s); setCoupons(c);
    } catch(e) {
      setUser({ id: 1, name: authUser?.name || 'İstifadəçi', role, ecoPoints: 350, level: 3 });
      setStats({ timeSavedMinutes: 312, fuelSavedPercent: 18.5, emergencyYields: 4, violations: 0, tripsCount: 47 });
      setCoupons([
        { id: 1, partnerName: 'Bravo Supermarket', partnerLogo: '🛒', description: 'Bravo marketdə alış-verişə endirim', discount: '5%', ecoPointsCost: 100 },
        { id: 2, partnerName: 'SOCAR', partnerLogo: '⛽', description: 'SOCAR-da pulsuz yanacaq', discount: '10 AZN', ecoPointsCost: 250 },
        { id: 3, partnerName: 'Bolt', partnerLogo: '🚕', description: 'Bolt taksi endirimi', discount: '20%', ecoPointsCost: 150 },
        { id: 4, partnerName: 'Park Cinema', partnerLogo: '🎬', description: 'Park Cinema bilet endirimi', discount: '50%', ecoPointsCost: 200 },
        { id: 5, partnerName: 'Wolt', partnerLogo: '🍕', description: 'Wolt sifarişinə endirim', discount: '30%', ecoPointsCost: 120 },
      ]);
    }
  }

  const handleRedeem = async (coupon) => {
    if (user && user.ecoPoints < coupon.ecoPointsCost) {
      alert('Kifayət qədər Eko-balınız yoxdur!');
      return;
    }
    try {
      const result = await api.redeemCoupon(1, coupon.id);
      setQrModal({ ...result, partnerName: coupon.partnerName, discount: coupon.discount });
      setUser(prev => ({ ...prev, ecoPoints: result.remainingPoints }));
    } catch(e) {
      const code = `SMARTBAKU-${coupon.partnerName.toUpperCase().replace(/ /g, '')}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setQrModal({ qrCode: code, partnerName: coupon.partnerName, discount: coupon.discount });
      setUser(prev => ({ ...prev, ecoPoints: prev.ecoPoints - coupon.ecoPointsCost }));
    }
  };

  const nextLevelPoints = (user?.level || 1) * 200;
  const progress = user ? Math.min((user.ecoPoints / nextLevelPoints) * 100, 100) : 0;
  const achievements = role === 'driver' ? ACHIEVEMENTS : ACHIEVEMENTS_PEDESTRIAN;

  return (
    <div className="page">
      {/* ═══ PROFILE HEADER ═══ */}
      <div className="profile-header">
        <div className="profile-avatar">{role === 'driver' ? '🚗' : '🚶'}</div>
        <div className="profile-name">{user?.name || authUser?.name || 'İstifadəçi'}</div>
        <div className="profile-role-badge">
          {role === 'driver' ? '🚗 Sürücü' : '🚶 Piyada'} • Səviyyə {user?.level || 1}
        </div>
        <div className="progress-bar" style={{marginTop: '16px'}}>
          <div className="progress-fill accent" style={{width: `${progress}%`}}></div>
        </div>
        <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', position: 'relative', zIndex: 1}}>
          {user?.ecoPoints || 0} / {nextLevelPoints} Eko-bal
        </div>
      </div>

      {/* ═══ ECO POINTS BANNER ═══ */}
      <div className="card" style={{background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.08))', borderColor: 'rgba(16,185,129,0.2)', textAlign: 'center'}}>
        <div style={{fontSize: '36px', marginBottom: '6px'}}>🌿</div>
        <div style={{fontSize: '32px', fontWeight: 900, color: '#34d399'}}>{user?.ecoPoints || 0}</div>
        <div style={{fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600}}>Eko-bal balansı</div>
        <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px'}}>
          Eko-balları topla, mükafatlar qazan!
        </div>
      </div>

      {/* ═══ SECTION TABS ═══ */}
      <div className="tabs">
        <button className={`tab-btn ${activeSection === 'stats' ? 'active' : ''}`} onClick={() => setActiveSection('stats')}>📊 Statistika</button>
        <button className={`tab-btn ${activeSection === 'rewards' ? 'active' : ''}`} onClick={() => setActiveSection('rewards')}>🎁 Mükafatlar</button>
        <button className={`tab-btn ${activeSection === 'achievements' ? 'active' : ''}`} onClick={() => setActiveSection('achievements')}>🏅 Nailiyyətlər</button>
      </div>

      {/* ═══ STATS SECTION ═══ */}
      {activeSection === 'stats' && stats && (
        <>
          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-value" style={{color: '#34d399'}}>⏱️ {Math.round(stats.timeSavedMinutes / 60)}</div>
              <div className="stat-label">Saat Qənaət</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{color: '#60a5fa'}}>⛽ {stats.fuelSavedPercent}%</div>
              <div className="stat-label">Yanacaq Qənaəti</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{color: '#a78bfa'}}>🚑 {stats.emergencyYields}</div>
              <div className="stat-label">Təcili Yardıma Yol</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{color: stats.violations > 0 ? '#f87171' : '#34d399'}}>
                {stats.violations > 0 ? '⚠️' : '✅'} {stats.violations}
              </div>
              <div className="stat-label">Pozuntu</div>
            </div>
          </div>

          {/* Citizenship Index */}
          <div className="card" style={{borderLeft: '4px solid var(--accent-green)'}}>
            <h4 style={{fontSize: '13px', color: '#34d399', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
              🏅 Vətəndaşlıq İndeksi
            </h4>
            <p style={{fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7}}>
              Bu ay <strong style={{color: 'white'}}>{stats.emergencyYields} dəfə</strong> təcili yardıma yol vermisiniz
              və <strong style={{color: '#34d399'}}>{stats.violations === 0 ? 'heç bir' : stats.violations}</strong> qayda pozmamısınız.
              Cəmi <strong style={{color: 'white'}}>{stats.tripsCount} səfər</strong> etmisiniz.
            </p>
            <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
              <span className="badge badge-green">Nümunəvi</span>
              <span className="badge badge-blue">Top 15%</span>
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <div className="section-title" style={{marginBottom: '8px'}}>Hesab Məlumatları</div>
            <div className="info-row">
              <span className="info-row-label">📧 Email</span>
              <span className="info-row-value">{authUser?.email || 'user@smartbaku.az'}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">👤 Ad</span>
              <span className="info-row-value">{authUser?.name || user?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">📅 Qoşulma tarixi</span>
              <span className="info-row-value">{new Date(authUser?.createdAt || Date.now()).toLocaleDateString('az-AZ')}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">🎯 Rol</span>
              <span className="info-row-value">{role === 'driver' ? 'Sürücü' : 'Piyada'}</span>
            </div>
          </div>
        </>
      )}

      {/* ═══ REWARDS SECTION ═══ */}
      {activeSection === 'rewards' && (
        <>
          <div className="section-title">Mövcud Mükafatlar</div>
          {coupons.map(c => (
            <div className="coupon-card" key={c.id} onClick={() => handleRedeem(c)}>
              <div className="coupon-logo">{c.partnerLogo}</div>
              <div className="coupon-info">
                <h4>{c.partnerName}</h4>
                <p>{c.description}</p>
              </div>
              <div style={{textAlign: 'right', flexShrink: 0}}>
                <div className="coupon-discount">{c.discount}</div>
                <div className="coupon-cost">{c.ecoPointsCost} bal</div>
              </div>
            </div>
          ))}

          <div className="card" style={{textAlign: 'center', background: 'rgba(255,255,255,0.02)', marginTop: '8px'}}>
            <div style={{fontSize: '28px', marginBottom: '6px'}}>💎</div>
            <p style={{fontSize: '12px', color: 'var(--text-secondary)'}}>
              Daha çox eko-bal toplamaq üçün qaydaları pozma, yaşıl dalğadan istifadə et və təcili yardıma yol ver!
            </p>
          </div>
        </>
      )}

      {/* ═══ ACHIEVEMENTS SECTION ═══ */}
      {activeSection === 'achievements' && (
        <>
          <div className="section-title">Nailiyyətlər</div>
          {achievements.map((a, i) => (
            <div className="card" key={i} style={{
              opacity: a.unlocked ? 1 : 0.45,
              borderColor: a.unlocked ? 'rgba(59,130,246,0.2)' : 'var(--border)',
            }}>
              <div style={{display: 'flex', gap: '14px', alignItems: 'center'}}>
                <div style={{
                  fontSize: '32px', width: '56px', height: '56px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: a.unlocked ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                  borderRadius: '16px', border: `1px solid ${a.unlocked ? 'rgba(59,130,246,0.2)' : 'var(--border)'}`,
                  flexShrink: 0
                }}>
                  {a.icon}
                </div>
                <div style={{flex: 1}}>
                  <h4 style={{fontSize: '14px', fontWeight: 800, marginBottom: '3px'}}>{a.title}</h4>
                  <p style={{fontSize: '12px', color: 'var(--text-secondary)'}}>{a.desc}</p>
                </div>
                {a.unlocked ? (
                  <span className="badge badge-green" style={{fontSize: '10px'}}>✅</span>
                ) : (
                  <span className="badge badge-yellow" style={{fontSize: '10px'}}>🔒</span>
                )}
              </div>
            </div>
          ))}

          <div className="card" style={{textAlign: 'center', marginTop: '4px'}}>
            <div style={{fontSize: '14px', fontWeight: 800, color: 'white', marginBottom: '4px'}}>
              {achievements.filter(a => a.unlocked).length} / {achievements.length}
            </div>
            <div className="progress-bar">
              <div className="progress-fill accent" style={{width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%`}}></div>
            </div>
            <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px'}}>
              Nailiyyət proqresi
            </div>
          </div>
        </>
      )}

      {/* ═══ APP INFO ═══ */}
      <div className="card" style={{textAlign: 'center', marginTop: '16px', background: 'rgba(255,255,255,0.02)'}}>
        <div style={{fontSize: '20px', marginBottom: '4px'}}>🚦</div>
        <div style={{fontSize: '14px', fontWeight: 800, marginBottom: '2px'}}>SmartBaku v2.0</div>
        <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>AI-powered Traffic Management</div>
      </div>

      {/* ═══ LOGOUT ═══ */}
      <button className="btn btn-outline" onClick={onLogout} style={{marginTop: '12px', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171'}}>
        🚪 Hesabdan çıxış
      </button>

      {/* ═══ QR MODAL ═══ */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{fontSize: '48px', marginBottom: '8px'}}>🎉</div>
            <h3 style={{fontSize: '18px', fontWeight: 900, marginBottom: '4px'}}>Kupon Aktivdir!</h3>
            <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px'}}>{qrModal.partnerName} — {qrModal.discount}</p>
            <div className="modal-qr">
              <div style={{fontFamily: 'monospace', fontSize: '10px', wordBreak: 'break-all', color: '#000', textAlign: 'center'}}>
                <div style={{fontSize: '48px', marginBottom: '8px'}}>📱</div>
                {qrModal.qrCode}
              </div>
            </div>
            <p style={{fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px'}}>Bu QR kodu kassada göstərin</p>
            <button className="btn btn-primary" onClick={() => setQrModal(null)}>Bağla</button>
          </div>
        </div>
      )}
    </div>
  );
}
