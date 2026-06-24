import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/axios';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({ questions: [], faqs: [] });
  const [loading, setLoading] = useState(false);

  const doSearch = q => {
    if (!q || q.length < 2) { setResults({ questions: [], faqs: [] }); return; }
    setLoading(true);
    api.get(`/search?q=${encodeURIComponent(q)}`).then(r => setResults(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { doSearch(query); }, []);

  const handleSearch = e => {
    e.preventDefault();
    setSearchParams({ q: query });
    doSearch(query);
  };

  const total = results.questions.length + results.faqs.length;

  return (
    <div className="page-container section-gap" style={{ maxWidth: 800 }}>
      <div className="m-stripe" style={{ width: 60, marginBottom: 24 }} />
      <h1 style={{ fontSize: 36, fontWeight: 700, textTransform: 'uppercase', marginBottom: 32 }}>SEARCH</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, marginBottom: 48 }}>
        <input className="input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search questions, FAQs, tags…" style={{ flex: 1, borderRight: 'none' }} />
        <button type="submit" className="btn-primary filled" style={{ flexShrink: 0, borderLeft: 'none' }}>SEARCH</button>
      </form>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Searching…</div>}

      {!loading && query.length >= 2 && total === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: 'var(--body)', fontSize: 18 }}>No results for "<strong>{query}</strong>"</p>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8, marginBottom: 24 }}>Try different keywords or ask a new question.</p>
          <Link to={`/ask`} className="btn-primary btn-sm">ASK THIS QUESTION</Link>
        </div>
      )}

      {results.questions.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--body)', marginBottom: 16 }}>
            QUESTIONS ({results.questions.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--hairline)' }}>
            {results.questions.map(q => (
              <div key={q._id} className="card" style={{ borderColor: 'transparent' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', minWidth: 56 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: q.score > 0 ? 'var(--success)' : 'var(--on-dark)' }}>{q.score}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>votes</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link to={`/questions/${q.id}`} style={{ color: 'var(--on-dark)', textDecoration: 'none', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', marginBottom: 6 }}>{q.title}</Link>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {q.tags.slice(0, 3).map(t => <span key={t} className="tag" style={{ fontSize: 11 }}>{t}</span>)}
                      <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 'auto' }}>{q.answerCount} answers · {timeAgo(q.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.faqs.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--body)', marginBottom: 16 }}>
            OFFICIAL FAQS ({results.faqs.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--hairline)' }}>
            {results.faqs.map(f => (
              <div key={f._id} className="card" style={{ borderColor: 'transparent', borderLeft: '3px solid var(--m-blue-dark)' }}>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {f.category && <span className="tag" style={{ fontSize: 11 }}>{f.category}</span>}
                  <span style={{ fontSize: 11, color: 'var(--m-blue-dark)', fontWeight: 700, letterSpacing: 1 }}>OFFICIAL FAQ</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 8 }}>Q: {f.question}</p>
                <p style={{ color: 'var(--body)', fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>A: {f.answer.substring(0, 200)}{f.answer.length > 200 ? '…' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
