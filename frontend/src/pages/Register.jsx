import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container section-gap" style={{ maxWidth: 480 }}>
      <div className="m-stripe" style={{ width: 60, marginBottom: 32 }} />
      <h1 style={{ fontSize: 40, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>JOIN</h1>
      <p style={{ color: 'var(--body)', fontWeight: 300, marginBottom: 40 }}>Create your CrowdFAQ account and start contributing.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {error && <div style={{ background: 'rgba(226,39,24,0.1)', border: '1px solid var(--m-red)', padding: '12px 16px', color: 'var(--m-red)', fontSize: 14 }}>{error}</div>}

        <div>
          <label className="label">FULL NAME</label>
          <input className="input" type="text" value={form.name} onChange={set('name')} placeholder="Your Name" required />
        </div>
        <div>
          <label className="label">EMAIL</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
        </div>
        <div>
          <label className="label">PASSWORD</label>
          <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" minLength={6} required />
        </div>

        <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--hairline)', padding: '16px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--body)', marginBottom: 8 }}>REPUTATION LEVELS</p>
          {[['Beginner', '0–100 pts', 'level-beginner'], ['Contributor', '101–500 pts', 'level-contributor'], ['Expert', '501+ pts', 'level-expert']].map(([name, pts, cls]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 4 }}>
              <span className={cls} style={{ fontWeight: 700 }}>{name}</span>
              <span style={{ color: 'var(--muted)' }}>{pts}</span>
            </div>
          ))}
        </div>

        <button type="submit" className="btn-primary filled" disabled={loading} style={{ marginTop: 8, justifyContent: 'center' }}>
          {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <p style={{ marginTop: 32, color: 'var(--body)', fontSize: 14 }}>
        Already a member? <Link to="/login" style={{ color: 'var(--on-dark)', fontWeight: 700 }}>Login</Link>
      </p>
    </div>
  );
}
