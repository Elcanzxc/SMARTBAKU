import { api } from '../services/api';

export default function RoleSelectPage({ onSelect }) {
  const handleSelect = async (role) => {
    try { await api.selectRole(role); } catch(e) { /* offline ok */ }
    onSelect(role);
  };

  return (
    <div className="role-page">
      <div className="role-logo">🚦</div>
      <h1 className="role-title">SmartBaku</h1>
      <p className="role-subtitle">Bakının ağıllı nəqliyyat idarəetmə platforması</p>

      <div className="role-card" onClick={() => handleSelect('driver')} id="role-driver">
        <div className="icon">🚗</div>
        <h3>Mən Sürücüyəm</h3>
        <p>Canlı tıxac xəritəsi, yaşıl dalğa naviqasiyası, rəqəmsal siren və dinamik qaydalar</p>
      </div>

      <div className="role-card" onClick={() => handleSelect('pedestrian')} id="role-pedestrian">
        <div className="icon">🚶</div>
        <h3>Mən Piyadayam</h3>
        <p>Ağıllı piyada keçidi, bir düymə ilə yaşıl işıq tələb edin</p>
      </div>
    </div>
  );
}
