import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('questions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}/stats`).then(r => setProfile(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>Loading…</div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--m-red)' }}>User not found.</div>;

  const level = profile.reputation >= 501 ? 'EXPERT' : profile.reputation >= 101 ? 'CONTRIBUTOR' : 'BEGINNER';
  const levelColor = profile.reputation >= 501 ? 'var(--warning)' : profile.reputation >= 101 ? 'var(--m-blue-dark)' : 'var(--body)';

  return (
    <div className="page-container section-gap">
      {/* Profile header */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 48, flexWrap: 'wrap' }}>
        <div style={{ width: 80, height: 80, background: 'var(--surface-card)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700 }}>
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div className="m-stripe" style={{ width: 40, marginBottom: 12 }} />
          <h1 style={{ fontSize: 32, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>{profile.name}</h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: levelColor, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{level}</span>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Member since {new Date(profile.createdAt).getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1, background: 'var(--hairline)', marginBottom: 48 }}>
        {[
          [profile.reputation, 'REPUTATION'],
          [profile.questionsCount, 'QUESTIONS'],
          [profile.answersCount, 'ANSWERS'],
          [profile.acceptedAnswers, 'ACCEPTED']
        ].map(([val, label]) => (
          <div key={label} style={{ background: 'var(--surface-soft)', padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{val}</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--hairline)', marginBottom: 32 }}>
        {[['questions', 'QUESTIONS'], ['answers', 'ANSWERS']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
            color: tab === val ? 'var(--on-dark)' : 'var(--muted)',
            borderBottom: tab === val ? '2px solid var(--on-dark)' : '2px solid transparent',
            padding: '0 24px 16px 0', marginBottom: -1
          }}>{label}</button>
        ))}
      </div>

      {/* Questions */}
      {tab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: profile.questions.length ? 'var(--hairline)' : 'transparent' }}>
          {profile.questions.length === 0 ? (
            <p style={{ color: 'var(--muted)', padding: 24 }}>No questions asked yet.</p>
          ) : profile.questions.map(q => (
            <div key={q._id} className="card" style={{ borderColor: 'transparent' }}>
              <Link to={`/questions/${q._id}`} style={{ textDecoration: 'none', color: 'var(--on-dark)', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', marginBottom: 6 }}>{q.title}</Link>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {q.tags.slice(0, 3).map(t => <span key={t} className="tag" style={{ fontSize: 11 }}>{t}</span>)}
                <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 'auto' }}>{timeAgo(q.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Answers */}
      {tab === 'answers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: profile.answers.length ? 'var(--hairline)' : 'transparent' }}>
          {profile.answers.length === 0 ? (
            <p style={{ color: 'var(--muted)', padding: 24 }}>No answers given yet.</p>
          ) : profile.answers.map(a => (
            <div key={a._id} className="card" style={{ borderColor: 'transparent', borderLeft: a.isAccepted ? '3px solid var(--success)' : '3px solid transparent' }}>
              {a.isAccepted && <div className="accepted-badge" style={{ marginBottom: 8 }}>✓ ACCEPTED</div>}
              <Link to={`/questions/${a.questionId}`} style={{ textDecoration: 'none', color: 'var(--body)', fontSize: 14, fontWeight: 300, lineHeight: 1.6, display: 'block' }}>{a.content.substring(0, 200)}{a.content.length > 200 ? '…' : ''}</Link>
              <span style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8, display: 'block' }}>{timeAgo(a.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
