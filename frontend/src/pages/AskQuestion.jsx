import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const ALL_TAGS = ['Academic', 'Attendance', 'Examination', 'Technical', 'Java', 'React', 'NodeJS', 'Placement', 'Resume', 'Internship'];

export default function AskQuestion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', tags: [] });
  const [similar, setSimilar] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customTag, setCustomTag] = useState('');

  useEffect(() => {
    if (form.title.length < 5) { setSimilar([]); return; }
    const t = setTimeout(() => {
      api.get(`/questions/check-duplicate?title=${encodeURIComponent(form.title)}`).then(r => setSimilar(r.data.similar || [])).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [form.title]);

  const toggleTag = tag => {
    setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !form.tags.includes(customTag.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, customTag.trim()] }));
      setCustomTag('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setLoading(true); setError('');
    try {
      const r = await api.post('/questions', form);
      navigate(`/questions/${r.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post question');
    } finally { setLoading(false); }
  };

  if (!user) return (
    <div className="page-container section-gap" style={{ textAlign: 'center' }}>
      <p style={{ color: 'var(--body)', marginBottom: 20 }}>You must be logged in to ask a question.</p>
      <Link to="/login" className="btn-primary filled">LOGIN</Link>
    </div>
  );

  return (
    <div className="page-container section-gap" style={{ maxWidth: 760 }}>
      <div className="m-stripe" style={{ width: 60, marginBottom: 24 }} />
      <h1 style={{ fontSize: 36, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>ASK A QUESTION</h1>
      <p style={{ color: 'var(--body)', fontWeight: 300, marginBottom: 40 }}>Help the community by asking a clear, specific question.</p>

      {/* Duplicate warning */}
      {similar.length > 0 && (
        <div style={{ background: 'rgba(28,105,212,0.1)', border: '1px solid var(--m-blue-dark)', padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--m-blue-dark)', marginBottom: 12 }}>⚠ SIMILAR QUESTIONS FOUND</p>
          <p style={{ color: 'var(--body)', fontSize: 14, marginBottom: 12 }}>Please check if your question is already answered:</p>
          {similar.map(q => (
            <Link key={q._id} to={`/questions/${q._id}`} target="_blank" style={{ display: 'block', color: 'var(--on-dark)', textDecoration: 'none', fontSize: 14, padding: '6px 0', borderBottom: '1px solid var(--hairline)' }}>→ {q.title}</Link>
          ))}
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>Still different? Continue posting below.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {error && <div style={{ background: 'rgba(226,39,24,0.1)', border: '1px solid var(--m-red)', padding: '12px 16px', color: 'var(--m-red)', fontSize: 14 }}>{error}</div>}

        <div>
          <label className="label">QUESTION TITLE</label>
          <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. How do I reset my ERP portal password?" required />
          <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>Be specific and imagine you're asking a person</p>
        </div>

        <div>
          <label className="label">DESCRIPTION</label>
          <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your problem in detail. Include what you've tried and what error you're seeing." style={{ minHeight: 200 }} required />
        </div>

        <div>
          <label className="label">TAGS</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {ALL_TAGS.map(t => (
              <button key={t} type="button" onClick={() => toggleTag(t)} className={`tag${form.tags.includes(t) ? ' active' : ''}`}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" value={customTag} onChange={e => setCustomTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())} placeholder="Add custom tag…" style={{ maxWidth: 240 }} />
            <button type="button" className="btn-primary btn-sm" onClick={addCustomTag}>ADD</button>
          </div>
          {form.tags.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {form.tags.map(t => <span key={t} className="tag active" style={{ cursor: 'default' }}>{t} <span onClick={() => toggleTag(t)} style={{ cursor: 'pointer', marginLeft: 4 }}>×</span></span>)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 16, paddingTop: 8 }}>
          <button type="submit" className="btn-primary filled" disabled={loading}>
            {loading ? 'POSTING…' : 'POST QUESTION'}
          </button>
          <button type="button" className="btn-primary" onClick={() => navigate('/questions')}>CANCEL</button>
        </div>
      </form>
    </div>
  );
}
