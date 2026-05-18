import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RoleSelectPage from './pages/RoleSelectPage';
import DashboardPage from './pages/DashboardPage';
import NavigationPage from './pages/NavigationPage';
import RulesPage from './pages/RulesPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

function App() {
  const [role, setRole] = useState(localStorage.getItem('smartbaku_role'));

  const handleRoleSelect = (r) => {
    localStorage.setItem('smartbaku_role', r);
    setRole(r);
  };

  if (!role) {
    return <RoleSelectPage onSelect={handleRoleSelect} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage role={role} />} />
        <Route path="/navigation" element={<NavigationPage role={role} />} />
        <Route path="/rules" element={<RulesPage role={role} />} />
        <Route path="/profile" element={<ProfilePage role={role} onRoleChange={handleRoleSelect} />} />
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
