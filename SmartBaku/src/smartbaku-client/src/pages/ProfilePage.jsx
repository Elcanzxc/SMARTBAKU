import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ProfilePage({ role, onRoleChange }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [qrModal, setQrModal] = useState(null);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const [u, s, c] = await Promise.all([api.getUser(), api.getUserStats(), api.getCoupons()]);
      setUser(u); setStats(s); setCoupons(c);
    } catch(e) {
      // Fallback data
      setUser({ id:1, name:'Demo Sürücü', role, ecoPoints:350, level:3 });
      setStats({ timeSavedMinutes:312, fuelSavedPercent:18.5, emergencyYields:4, violations:0, tripsCount:47 });
      setCoupons([
        { id:1, partnerName:'Bravo Supermarket', partnerLogo:'🛒', description:'Bravo marketdə alış-verişə endirim', discount:'5%', ecoPointsCost:100 },
        { id:2, partnerName:'SOCAR', partnerLogo:'⛽', description:'SOCAR-da pulsuz yanacaq', discount:'10 AZN', ecoPointsCost:250 },
        { id:3, partnerName:'Bolt', partnerLogo:'🚕', description:'Bolt taksi xidmətinə endirim', discount:'20%', ecoPointsCost:150 },
        { id:4, partnerName:'Park Cinema', partnerLogo:'🎬', description:'Park Cinema-da bilet endirimi', discount:'50%', ecoPointsCost:200 },
        { id:5, partnerName:'Wolt', partnerLogo:'🍕', description:'Wolt sifarişinə endirim', discount:'30%', ecoPointsCost:120 },
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
      const code = `SMARTBAKU-${coupon.partnerName.toUpperCase().replace(/ /g,'')}-${Math.random().toString(36).substring(2,10).toUpperCase()}`;
      setQrModal({ qrCode: code, partnerName: coupon.partnerName, discount: coupon.discount });
      setUser(prev => ({ ...prev, ecoPoints: prev.ecoPoints - coupon.ecoPointsCost }));
    }
  };

  const switchRole = () => {
    const newRole = role === 'driver' ? 'pedestrian' : 'driver';
    onRoleChange(newRole);
  };

  const nextLevelPoints = (user?.level || 1) * 200;
  const progress = user ? Math.min((user.ecoPoints / nextLevelPoints) * 100, 100) : 0;

  return (
    <div className="page">
      <h1 className="page-title">👤 Şəxsi Kabinet</h1>

      {/* Profile header */}
      <div className="profile-header">
        <div className="profile-avatar">{role === 'driver' ? '🚗' : '🚶'}</div>
        <div className="profile-name">{user?.name || 'İstifadəçi'}</div>
        <div className="profile-level">Səviyyə {user?.level || 1} • {user?.ecoPoints || 0} Eko-bal</div>
        <div className="progress-bar" style={{marginTop:'10px'}}>
          <div className="progress-fill accent" style={{width:`${progress}%`}}></div>
        </div>
        <div style={{fontSize:'11px',color:'var(--text-muted)',marginTop:'4px'}}>
          Növbəti səviyyəyə: {nextLevelPoints - (user?.ecoPoints || 0)} bal
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <>
          <h3 style={{fontSize:'14px',fontWeight:600,marginBottom:'8px'}}>📊 Statistika</h3>
          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-value" style={{color:'var(--accent-green)'}}>⏱️ {Math.round(stats.timeSavedMinutes / 60)}</div>
              <div className="stat-label">saat qənaət</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{color:'var(--accent)'}}>⛽ {stats.fuelSavedPercent}%</div>
              <div className="stat-label">yanacaq qənaəti</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{color:'var(--accent-purple)'}}>🚑 {stats.emergencyYields}</div>
              <div className="stat-label">təcili yardıma yol</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{color: stats.violations > 0 ? 'var(--accent-red)' : 'var(--accent-green)'}}>
                {stats.violations > 0 ? '⚠️' : '✅'} {stats.violations}
              </div>
              <div className="stat-label">qayda pozuntusu</div>
            </div>
          </div>

          {/* Citizenship index */}
          <div className="card" style={{background:'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,212,255,0.05))'}}>
            <h4 style={{fontSize:'13px',color:'var(--accent-green)',marginBottom:'6px'}}>🏅 Vətəndaşlıq İndeksi</h4>
            <p style={{fontSize:'12px',color:'var(--text-secondary)',lineHeight:1.5}}>
              Siz bu ay <strong style={{color:'var(--accent)'}}>{stats.emergencyYields} dəfə</strong> təcili yardıma yol vermisiniz
              və <strong style={{color:'var(--accent-green)'}}>heç bir</strong> sürət qaydasını pozmamısınız.
              <br/>Cəmi <strong style={{color:'var(--accent)'}}>{stats.tripsCount} səfər</strong> etmisiniz
              və <strong style={{color:'var(--accent-green)'}}>{Math.round(stats.timeSavedMinutes / 60)} saat</strong> vaxta qənaət etmisiniz.
            </p>
          </div>
        </>
      )}

      {/* Coupons */}
      <h3 style={{fontSize:'14px',fontWeight:600,marginBottom:'8px',marginTop:'12px'}}>🎁 Mükafatlar Portalı</h3>
      {coupons.map(c => (
        <div className="coupon-card" key={c.id} onClick={() => handleRedeem(c)}>
          <div className="coupon-logo">{c.partnerLogo}</div>
          <div className="coupon-info">
            <h4>{c.partnerName}</h4>
            <p>{c.description}</p>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="coupon-discount">{c.discount}</div>
            <div className="coupon-cost">{c.ecoPointsCost} bal</div>
          </div>
        </div>
      ))}

      {/* Role switch */}
      <button className="btn btn-outline" onClick={switchRole} style={{marginTop:'16px'}} id="switch-role-btn">
        {role === 'driver' ? '🚶 Piyada rejiminə keç' : '🚗 Sürücü rejiminə keç'}
      </button>

      {/* QR Modal */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{fontSize:'16px',marginBottom:'4px'}}>🎉 Kupon Aktivdir!</h3>
            <p style={{fontSize:'13px',color:'var(--text-secondary)'}}>{qrModal.partnerName} — {qrModal.discount}</p>
            <div className="modal-qr">
              <div style={{fontFamily:'monospace',fontSize:'10px',wordBreak:'break-all',color:'#000',textAlign:'center'}}>
                <div style={{fontSize:'48px',marginBottom:'8px'}}>📱</div>
                {qrModal.qrCode}
              </div>
            </div>
            <p style={{fontSize:'11px',color:'var(--text-muted)',marginBottom:'12px'}}>Bu QR kodu kassada göstərin</p>
            <button className="btn btn-primary" onClick={() => setQrModal(null)}>Bağla</button>
          </div>
        </div>
      )}
    </div>
  );
}
