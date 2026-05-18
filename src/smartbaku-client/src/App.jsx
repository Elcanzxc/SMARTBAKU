import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import NavigationPage from './pages/NavigationPage';
import RulesPage from './pages/RulesPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartbaku_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('smartbaku_user');
    setUser(null);
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const role = user.role;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage role={role} />} />
        <Route path="/navigation" element={<NavigationPage role={role} />} />
        <Route path="/rules" element={<RulesPage role={role} />} />
        <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">🗺️</span>
          <span>Xəritə</span>
        </NavLink>
        {role === 'driver' && (
          <NavLink to="/navigation" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">🧭</span>
            <span>Naviqasiya</span>
          </NavLink>
        )}
        <NavLink to="/rules" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">⚠️</span>
          <span>Qaydalar</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">👤</span>
          <span>Profil</span>
        </NavLink>
      </nav>
    </BrowserRouter>
  );
}

export default App;
