import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container section-gap" style={{ maxWidth: 480 }}>
      <div className="m-stripe" style={{ width: 60, marginBottom: 32 }} />
      <h1 style={{ fontSize: 40, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>LOGIN</h1>
      <p style={{ color: 'var(--body)', fontWeight: 300, marginBottom: 40 }}>Welcome back to CrowdFAQ.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {error && <div style={{ background: 'rgba(226,39,24,0.1)', border: '1px solid var(--m-red)', padding: '12px 16px', color: 'var(--m-red)', fontSize: 14 }}>{error}</div>}

        <div>
          <label className="label">EMAIL</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div>
          <label className="label">PASSWORD</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>

        <button type="submit" className="btn-primary filled" disabled={loading} style={{ marginTop: 8, justifyContent: 'center' }}>
          {loading ? 'LOGGING IN…' : 'LOGIN'}
        </button>
      </form>

      <p style={{ marginTop: 32, color: 'var(--body)', fontSize: 14 }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--on-dark)', fontWeight: 700 }}>Register</Link>
      </p>
    </div>
  );
}
