import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MStripe() {
  return <div className="m-stripe" />;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const level = !user ? null : user.reputation >= 501 ? 'EXPERT' : user.reputation >= 101 ? 'CONTRIBUTOR' : 'BEGINNER';
  const levelClass = !user ? '' : user.reputation >= 501 ? 'level-expert' : user.reputation >= 101 ? 'level-contributor' : 'level-beginner';

  const links = [
    { to: '/', label: 'Home' },
    { to: '/questions', label: 'Questions' },
    { to: '/faqs', label: 'FAQs' },
  ];

  return (
    <nav style={{ background: 'var(--canvas)', borderBottom: '1px solid var(--hairline)', position: 'sticky', top: 0, zIndex: 100 }}>
      <MStripe />
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 40 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 8, height: 24, background: 'var(--m-blue-light)' }} />
            <div style={{ width: 8, height: 24, background: 'var(--m-blue-dark)' }} />
            <div style={{ width: 8, height: 24, background: 'var(--m-red)' }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--on-dark)' }}>
            Crowd<span style={{ color: 'var(--m-blue-dark)' }}>FAQ</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 32, flex: 1 }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: location.pathname === l.to ? 700 : 400,
              letterSpacing: 0.5,
              color: location.pathname === l.to ? 'var(--on-dark)' : 'var(--body)',
              borderBottom: location.pathname === l.to ? '2px solid var(--on-dark)' : '2px solid transparent',
              paddingBottom: 2,
              transition: 'color 0.2s'
            }}>{l.label}</Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
          <Link to="/search" style={{ color: 'var(--body)', fontSize: 20, textDecoration: 'none', lineHeight: 1 }} title="Search">🔍</Link>
          {user ? (
            <>
              <Link to="/ask" className="btn-primary btn-sm" style={{ display: 'none' }}>ASK</Link>
              <Link to="/ask" className="btn-primary btn-sm">+ ASK</Link>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{
                  background: 'var(--surface-card)', border: '1px solid var(--hairline)', color: 'var(--on-dark)',
                  padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span>{user.name.split(' ')[0].toUpperCase()}</span>
                  <span className={levelClass} style={{ fontSize: 11 }}>· {level}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>▾</span>
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'var(--surface-card)', border: '1px solid var(--hairline)', minWidth: 180, zIndex: 200 }}>
                    <Link to={`/profile/${user.id}`} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: 'var(--body)', fontSize: 14, borderBottom: '1px solid var(--hairline)' }}>My Profile</Link>
                    {(user.role === 'admin' || user.role === 'moderator') && (
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: 'var(--body)', fontSize: 14, borderBottom: '1px solid var(--hairline)' }}>Dashboard</Link>
                    )}
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }} style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--m-red)', fontSize: 14, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/login" className="btn-primary btn-sm">LOGIN</Link>
              <Link to="/register" className="btn-primary btn-sm filled">REGISTER</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
