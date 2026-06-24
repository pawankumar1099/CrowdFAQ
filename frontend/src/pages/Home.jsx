import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const TAGS = ['Academic', 'Attendance', 'Examination', 'Technical', 'Java', 'React', 'NodeJS', 'Placement', 'Resume', 'Internship'];

function StatCard({ value, label }) {
  return (
    <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--hairline)', padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--on-dark)', marginBottom: 8 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [stats, setStats] = useState({ questions: 0, answers: 0, faqs: 0 });

  useEffect(() => {
    api.get('/questions?sort=top&limit=5').then(r => setQuestions(r.data.questions)).catch(() => {});
    api.get('/faq?limit=3').then(r => setFaqs(r.data.slice(0, 3))).catch(() => {});
    Promise.all([api.get('/questions?limit=1'), api.get('/faq')]).then(([q, f]) => {
      setStats(s => ({ ...s, questions: q.data.total, faqs: f.data.length }));
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'var(--canvas)', borderBottom: '1px solid var(--hairline)', padding: '80px 0' }}>
        <div className="page-container">
          <div style={{ maxWidth: 700 }}>
            <div className="m-stripe" style={{ width: 80, marginBottom: 32 }} />
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.05, marginBottom: 24, color: 'var(--on-dark)' }}>
              COMMUNITY<br />KNOWLEDGE.<br />
              <span style={{ color: 'var(--m-blue-dark)' }}>RELIABLE ANSWERS.</span>
            </h1>
            <p style={{ fontSize: 18, fontWeight: 300, color: 'var(--body)', lineHeight: 1.6, marginBottom: 40, maxWidth: 540 }}>
              Ask questions, contribute answers, vote on helpful content, and build a knowledge base together.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/questions" className="btn-primary filled">BROWSE QUESTIONS</Link>
              {!user && <Link to="/register" className="btn-primary">JOIN COMMUNITY</Link>}
              {user && <Link to="/ask" className="btn-primary">+ ASK A QUESTION</Link>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ borderBottom: '1px solid var(--hairline)', padding: '48px 0' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 1, background: 'var(--hairline)' }}>
            <StatCard value={stats.questions} label="Questions" />
            <StatCard value={stats.faqs} label="Official FAQs" />
            <StatCard value="∞" label="Community" />
          </div>
        </div>
      </div>

      <div className="page-container section-gap">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48 }}>
          {/* Trending Questions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <div className="m-stripe" style={{ width: 40, marginBottom: 12 }} />
                <h2 style={{ fontSize: 28, fontWeight: 700, textTransform: 'uppercase' }}>TRENDING QUESTIONS</h2>
              </div>
              <Link to="/questions" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--body)', textDecoration: 'none' }}>VIEW ALL →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--hairline)' }}>
              {questions.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <p style={{ color: 'var(--muted)', marginBottom: 16 }}>No questions yet. Be the first to ask!</p>
                  <Link to="/ask" className="btn-primary btn-sm">ASK A QUESTION</Link>
                </div>
              )}
              {questions.map(q => (
                <div key={q._id} className="card" style={{ borderColor: 'transparent' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ textAlign: 'center', minWidth: 56, padding: '4px 0' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: q.score > 0 ? 'var(--success)' : q.score < 0 ? 'var(--m-red)' : 'var(--on-dark)' }}>{q.score}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 0.5 }}>SCORE</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Link to={`/questions/${q.id}`} style={{ textDecoration: 'none', color: 'var(--on-dark)', fontSize: 16, fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{q.title}</Link>
                      <p style={{ color: 'var(--body)', fontSize: 14, fontWeight: 300, marginBottom: 12, lineHeight: 1.5 }}>{q.description.substring(0, 120)}{q.description.length > 120 ? '…' : ''}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {q.tags.slice(0, 3).map(t => <span key={t} className="tag" style={{ fontSize: 11 }}>{t}</span>)}
                        <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 'auto' }}>{q.answerCount} answer{q.answerCount !== 1 ? 's' : ''} · {q.views} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Tags */}
            <div style={{ marginBottom: 40 }}>
              <div className="m-stripe" style={{ width: 40, marginBottom: 12 }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>BROWSE BY TAG</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TAGS.map(t => (
                  <Link key={t} to={`/questions?tag=${t}`} className="tag" style={{ textDecoration: 'none' }}>{t}</Link>
                ))}
              </div>
            </div>

            {/* FAQs */}
            {faqs.length > 0 && (
              <div>
                <div className="m-stripe" style={{ width: 40, marginBottom: 12 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>OFFICIAL FAQS</h3>
                  <Link to="/faqs" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>ALL →</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--hairline)' }}>
                  {faqs.map(f => (
                    <div key={f._id} className="card" style={{ borderColor: 'transparent' }}>
                      <p style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{f.question}</p>
                      <p style={{ color: 'var(--body)', fontSize: 13, fontWeight: 300, lineHeight: 1.5 }}>{f.answer.substring(0, 100)}…</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {!user && (
              <div style={{ marginTop: 40, background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: 24 }}>
                <div className="m-stripe" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>JOIN THE COMMUNITY</h3>
                <p style={{ color: 'var(--body)', fontSize: 14, fontWeight: 300, marginBottom: 16, lineHeight: 1.5 }}>Ask questions, share knowledge, and build your reputation.</p>
                <Link to="/register" className="btn-primary btn-sm filled" style={{ display: 'block', textAlign: 'center' }}>GET STARTED</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
