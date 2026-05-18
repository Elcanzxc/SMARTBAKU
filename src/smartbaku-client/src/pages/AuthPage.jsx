import { useState } from 'react';
import './AuthPage.css';
import { api } from '../services/api';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('driver'); // driver | pedestrian
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post('/api/auth/login', { email, password });
        localStorage.setItem('smartbaku_user', JSON.stringify(res.data || res));
        onLogin(res.data || res);
      } else {
        const res = await api.post('/api/auth/register', { name, email, password, role });
        localStorage.setItem('smartbaku_user', JSON.stringify(res.data || res));
        onLogin(res.data || res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Sistem xətası baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h1 className="auth-title">
          {isLogin ? 'SmartBaku-ya daxil ol' : 'SmartBaku-da qeydiyyat'}
        </h1>
        <p className="auth-subtitle">Şəhərin ağıllı nəqliyyat sisteminə qoşul!</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Adınız</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          
          <div className="form-group">
            <label>Email adresi</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Şifrə</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Mən...</label>
              <div className="role-selector">
                <button type="button" className={`role-btn ${role === 'driver' ? 'active' : ''}`} onClick={() => setRole('driver')}>Sürücüyəm 🚙</button>
                <button type="button" className={`role-btn ${role === 'pedestrian' ? 'active' : ''}`} onClick={() => setRole('pedestrian')}>Piyadayam 🚶‍♂️</button>
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Gözləyin...' : (isLogin ? 'Daxil ol' : 'Qeydiyyatdan keç')}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Hesabınız yoxdur? " : "Artıq hesabınız var? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Qeydiyyatdan keçin" : "Daxil olun"}
          </span>
        </p>
      </div>
    </div>
  );
}
