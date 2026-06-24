import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface-soft)', borderTop: '1px solid var(--hairline)', marginTop: 96, padding: '48px 0 32px' }}>
      <div className="page-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                <div style={{ width: 6, height: 18, background: 'var(--m-blue-light)' }} />
                <div style={{ width: 6, height: 18, background: 'var(--m-blue-dark)' }} />
                <div style={{ width: 6, height: 18, background: 'var(--m-red)' }} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>CrowdFAQ</span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>Turning Community Knowledge into Reliable Answers.</p>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--body)', marginBottom: 16 }}>Platform</p>
            {[['/', 'Home'], ['/questions', 'Questions'], ['/faqs', 'FAQs'], ['/search', 'Search']].map(([to, label]) => (
              <Link key={to} to={to} style={{ display: 'block', color: 'var(--muted)', fontSize: 14, textDecoration: 'none', marginBottom: 8 }}>{label}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--body)', marginBottom: 16 }}>Contribute</p>
            {[['/ask', 'Ask a Question'], ['/register', 'Join Community']].map(([to, label]) => (
              <Link key={to} to={to} style={{ display: 'block', color: 'var(--muted)', fontSize: 14, textDecoration: 'none', marginBottom: 8 }}>{label}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--muted)', fontSize: 12 }}>© {new Date().getFullYear()} CrowdFAQ. All rights reserved.</p>
          <div style={{ height: 4, width: 60, background: 'linear-gradient(to right, var(--m-blue-light) 33.3%, var(--m-blue-dark) 33.3% 66.6%, var(--m-red) 66.6%)' }} />
        </div>
      </div>
    </footer>
  );
}
