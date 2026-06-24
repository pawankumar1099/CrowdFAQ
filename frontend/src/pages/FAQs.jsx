import { useState, useEffect } from 'react';
import api from '../lib/axios';

export default function FAQs() {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/faq'), api.get('/faq/categories')]).then(([f, c]) => {
      setFaqs(f.data);
      setCategories(c.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory ? faqs.filter(f => f.category === activeCategory) : faqs;

  return (
    <div className="page-container section-gap">
      <div className="m-stripe" style={{ width: 60, marginBottom: 24 }} />
      <h1 style={{ fontSize: 40, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>OFFICIAL FAQS</h1>
      <p style={{ color: 'var(--body)', fontWeight: 300, marginBottom: 40, maxWidth: 540 }}>
        High-quality answers promoted from the community. These questions received accepted answers and strong upvotes.
      </p>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--hairline)', marginBottom: 40, overflowX: 'auto' }}>
          <button onClick={() => setActiveCategory('')} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
            color: !activeCategory ? 'var(--on-dark)' : 'var(--muted)',
            borderBottom: !activeCategory ? '2px solid var(--on-dark)' : '2px solid transparent',
            padding: '0 24px 16px 0', marginBottom: -1, whiteSpace: 'nowrap'
          }}>ALL</button>
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
              color: activeCategory === c ? 'var(--on-dark)' : 'var(--muted)',
              borderBottom: activeCategory === c ? '2px solid var(--on-dark)' : '2px solid transparent',
              padding: '0 24px 16px 0', marginBottom: -1, whiteSpace: 'nowrap'
            }}>{c}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>NO FAQS YET</h2>
          <p style={{ color: 'var(--body)', fontWeight: 300 }}>FAQs are automatically generated when highly-rated Q&As meet the threshold.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--hairline)' }}>
          {filtered.map(faq => (
            <div key={faq._id} className="card" style={{ borderColor: 'transparent', cursor: 'pointer' }} onClick={() => setOpenId(openId === faq._id ? null : faq._id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    {faq.category && <span className="tag" style={{ fontSize: 11 }}>{faq.category}</span>}
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>OFFICIAL FAQ</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, color: 'var(--on-dark)' }}>{faq.question}</h3>
                  {openId === faq.id && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--hairline)' }}>
                      <div className="m-stripe" style={{ width: 32, marginBottom: 12 }} />
                      <p style={{ color: 'var(--body)', fontWeight: 300, lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap' }}>{faq.answer}</p>
                    </div>
                  )}
                </div>
                <span style={{ color: 'var(--muted)', fontSize: 20, flexShrink: 0 }}>{openId === faq.id ? '−' : '+'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
