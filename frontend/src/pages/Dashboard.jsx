import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin' && user.role !== 'moderator') { navigate('/'); return; }
    Promise.all([api.get('/users/admin/dashboard'), api.get('/users/leaderboard')]).then(([d, l]) => {
      setData(d.data); setLeaderboard(l.data);
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) return null;
  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>Loading…</div>;

  return (
    <div className="page-container section-gap">
      <div className="m-stripe" style={{ width: 60, marginBottom: 24 }} />
      <h1 style={{ fontSize: 36, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>DASHBOARD</h1>
      <p style={{ color: 'var(--muted)', fontWeight: 300, marginBottom: 40, textTransform: 'uppercase', letterSpacing: 1, fontSize: 13 }}>{user.role} access</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 1, background: 'var(--hairline)', marginBottom: 48 }}>
        {[
          [data?.totalUsers, 'TOTAL USERS'],
          [data?.totalQuestions, 'QUESTIONS'],
          [data?.totalAnswers, 'ANSWERS'],
          [data?.totalFaqs, 'OFFICIAL FAQS'],
        ].map(([val, label]) => (
          <div key={label} style={{ background: 'var(--surface-soft)', padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 8 }}>{val ?? 0}</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, flexWrap: 'wrap' }}>
        <div>
          <div className="m-stripe" style={{ width: 40, marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>TRENDING TAGS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--hairline)' }}>
            {(data?.trendingTags || []).map((t, i) => (
              <div key={t.tag} className="card" style={{ borderColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, minWidth: 20 }}>#{i + 1}</span>
                  <span className="tag" style={{ fontSize: 12 }}>{t.tag}</span>
                </div>
                <span style={{ color: 'var(--body)', fontSize: 14 }}>{t.count} questions</span>
              </div>
            ))}
            {(data?.trendingTags || []).length === 0 && (
              <div className="card" style={{ borderColor: 'transparent', color: 'var(--muted)' }}>No data yet</div>
            )}
          </div>
        </div>

        <div>
          <div className="m-stripe" style={{ width: 40, marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>TOP CONTRIBUTORS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--hairline)' }}>
            {leaderboard.map((u, i) => {
              const levelColor = u.reputation >= 501 ? 'var(--warning)' : u.reputation >= 101 ? 'var(--m-blue-dark)' : 'var(--body)';
              return (
                <div key={u.id} className="card" style={{ borderColor: 'transparent', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: i < 3 ? 'var(--warning)' : 'var(--muted)', minWidth: 24 }}>#{i + 1}</span>
                  <Link to={`/profile/${u.id}`} style={{ color: 'var(--on-dark)', textDecoration: 'none', flex: 1, fontWeight: 700, textTransform: 'uppercase', fontSize: 13 }}>{u.name}</Link>
                  <span style={{ color: levelColor, fontSize: 12, fontWeight: 700 }}>{u.reputation} pts</span>
                </div>
              );
            })}
            {leaderboard.length === 0 && (
              <div className="card" style={{ borderColor: 'transparent', color: 'var(--muted)' }}>No users yet</div>
            )}
          </div>
        </div>
      </div>

      {data?.recentUsers?.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <div className="m-stripe" style={{ width: 40, marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>RECENT REGISTRATIONS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--hairline)' }}>
            {data.recentUsers.map(u => (
              <div key={u.id} className="card" style={{ borderColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Link to={`/profile/${u.id}`} style={{ color: 'var(--on-dark)', textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: 14 }}>{u.name}</Link>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{u.email}</span>
                  <span className="tag" style={{ fontSize: 11 }}>{u.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
