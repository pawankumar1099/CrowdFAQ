import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const SORT_TABS = [['newest', 'NEWEST'], ['top', 'TOP VOTED'], ['unanswered', 'UNANSWERED']];
const TAGS = ['Academic', 'Attendance', 'Examination', 'Technical', 'Java', 'React', 'NodeJS', 'Placement', 'Resume', 'Internship'];

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Questions() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const sort = searchParams.get('sort') || 'newest';
  const tag = searchParams.get('tag') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort, page, limit: 15 });
    if (tag) params.set('tag', tag);
    api.get(`/questions?${params}`).then(r => {
      setQuestions(r.data.questions);
      setTotal(r.data.total);
    }).finally(() => setLoading(false));
  }, [sort, tag, page]);

  return (
    <div className="page-container section-gap">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="m-stripe" style={{ width: 60, marginBottom: 16 }} />
          <h1 style={{ fontSize: 36, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>QUESTIONS</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{total} question{total !== 1 ? 's' : ''}</p>
        </div>
        {user && <Link to="/ask" className="btn-primary filled">+ ASK A QUESTION</Link>}
      </div>

      {/* Sort tabs */}
      <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--hairline)', marginBottom: 32 }}>
        {SORT_TABS.map(([val, label]) => (
          <button key={val} onClick={() => { setPage(1); setSearchParams(p => { p.set('sort', val); return p; }); }} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
            color: sort === val ? 'var(--on-dark)' : 'var(--muted)',
            borderBottom: sort === val ? '2px solid var(--on-dark)' : '2px solid transparent',
            padding: '0 0 16px', marginBottom: -1, transition: 'color 0.2s'
          }}>{label}</button>
        ))}
      </div>

      {/* Tag filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
        <button onClick={() => { setPage(1); setSearchParams(p => { p.delete('tag'); return p; }); }} className={`tag${!tag ? ' active' : ''}`}>ALL</button>
        {TAGS.map(t => (
          <button key={t} onClick={() => { setPage(1); setSearchParams(p => { p.set('tag', t); return p; }); }} className={`tag${tag === t ? ' active' : ''}`}>{t}</button>
        ))}
      </div>

      {/* Questions list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading…</div>
      ) : questions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 18 }}>No questions found</p>
          {user && <Link to="/ask" className="btn-primary btn-sm">ASK THE FIRST QUESTION</Link>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--hairline)' }}>
          {questions.map(q => (
            <div key={q._id} className="card" style={{ borderColor: 'transparent', borderRadius: 0 }}>
              <div style={{ display: 'flex', gap: 20 }}>
                {/* Stats column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 72, alignItems: 'center', paddingTop: 4 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: q.score > 0 ? 'var(--success)' : q.score < 0 ? 'var(--m-red)' : 'var(--on-dark)' }}>{q.score}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase' }}>votes</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '4px 10px', border: q.acceptedAnswerId ? '1px solid var(--success)' : '1px solid var(--hairline)', background: q.acceptedAnswerId ? 'rgba(15,163,54,0.1)' : 'transparent' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: q.acceptedAnswerId ? 'var(--success)' : 'var(--body)' }}>{q.answerCount}</div>
                    <div style={{ fontSize: 10, color: q.acceptedAnswerId ? 'var(--success)' : 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase' }}>ans</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, color: 'var(--muted)' }}>{q.views}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase' }}>views</div>
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <Link to={`/questions/${q.id}`} style={{ textDecoration: 'none', color: 'var(--on-dark)', fontSize: 17, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', marginBottom: 8 }}>{q.title}</Link>
                  <p style={{ color: 'var(--body)', fontSize: 14, fontWeight: 300, lineHeight: 1.5, marginBottom: 12 }}>{q.description.substring(0, 160)}{q.description.length > 160 ? '…' : ''}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {q.tags.map(t => <span key={t} className="tag" style={{ fontSize: 11 }}>{t}</span>)}
                    <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 12 }}>
                      {q.author?.name} · {timeAgo(q.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 15 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 }}>
          {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              width: 40, height: 40, border: '1px solid', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
              borderColor: page === p ? 'var(--on-dark)' : 'var(--hairline)',
              background: page === p ? 'var(--on-dark)' : 'transparent',
              color: page === p ? 'var(--canvas)' : 'var(--body)'
            }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
