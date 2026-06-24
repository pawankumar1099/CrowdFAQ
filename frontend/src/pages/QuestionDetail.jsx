import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function VoteBlock({ score, targetType, targetId, myVotes, onVote }) {
  const myVote = myVotes.find(v => v.targetType === targetType && v.targetId === targetId);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 48 }}>
      <button className={`vote-btn up${myVote?.type === 'up' ? ' active' : ''}`} onClick={() => onVote(targetType, targetId, 'up')} title="Upvote">▲</button>
      <span style={{ fontSize: 20, fontWeight: 700, color: score > 0 ? 'var(--success)' : score < 0 ? 'var(--m-red)' : 'var(--on-dark)' }}>{score}</span>
      <button className={`vote-btn down${myVote?.type === 'down' ? ' active' : ''}`} onClick={() => onVote(targetType, targetId, 'down')} title="Downvote">▼</button>
    </div>
  );
}

export default function QuestionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get(`/questions/${id}`),
      api.get(`/answers/question/${id}`),
      user ? api.get('/votes/my') : Promise.resolve({ data: [] })
    ]).then(([q, a, v]) => {
      setQuestion(q.data);
      setAnswers(a.data);
      setMyVotes(v.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id, user]);

  const handleVote = async (targetType, targetId, type) => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/votes', { targetType, targetId, type });
      const [q, a, v] = await Promise.all([api.get(`/questions/${id}`), api.get(`/answers/question/${id}`), api.get('/votes/my')]);
      setQuestion(q.data); setAnswers(a.data); setMyVotes(v.data);
    } catch {}
  };

  const handleAnswer = async e => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true); setError('');
    try {
      await api.post('/answers', { questionId: id, content: answerText });
      setAnswerText('');
      const [a] = await Promise.all([api.get(`/answers/question/${id}`)]);
      setAnswers(a.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post answer');
    } finally { setSubmitting(false); }
  };

  const handleAccept = async answerId => {
    try {
      await api.post(`/answers/${answerId}/accept`);
      const [q, a] = await Promise.all([api.get(`/questions/${id}`), api.get(`/answers/question/${id}`)]);
      setQuestion(q.data); setAnswers(a.data);
    } catch {}
  };

  const handleDelete = async () => {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/questions/${id}`);
    navigate('/questions');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>Loading…</div>;
  if (!question) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--m-red)' }}>Question not found.</div>;

  return (
    <div className="page-container section-gap">
      {/* Question */}
      <div style={{ marginBottom: 48 }}>
        <div className="m-stripe" style={{ width: 60, marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 24 }}>
          <VoteBlock score={question.score} targetType="question" targetId={question.id} myVotes={myVotes} onVote={handleVote} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16, lineHeight: 1.2 }}>{question.title}</h1>
            <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>Asked {timeAgo(question.createdAt)}</span>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>{question.views} views</span>
              {question.author && <span style={{ color: 'var(--muted)', fontSize: 13 }}>by <span style={{ color: 'var(--body)' }}>{question.author.name}</span></span>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {question.tags.map(t => <span key={t} className="tag" style={{ fontSize: 11 }}>{t}</span>)}
            </div>
            <p style={{ color: 'var(--body)', fontWeight: 300, lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap' }}>{question.description}</p>

            {user && (user.id === question.userId || user.role === 'admin') && (
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn-primary btn-sm danger" onClick={handleDelete}>DELETE</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="m-stripe" style={{ marginBottom: 40 }} />

      {/* Answers */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 }}>
          {answers.length} ANSWER{answers.length !== 1 ? 'S' : ''}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: answers.length ? 'var(--hairline)' : 'transparent' }}>
          {answers.map(a => (
            <div key={a._id} className="card" style={{ borderColor: 'transparent', borderLeft: a.isAccepted ? '3px solid var(--success)' : '3px solid transparent' }}>
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 48 }}>
                  <button className={`vote-btn up${myVotes.find(v => v.targetType === 'answer' && v.targetId === a._id)?.type === 'up' ? ' active' : ''}`} onClick={() => handleVote('answer', a._id, 'up')}>▲</button>
                  <span style={{ fontSize: 18, fontWeight: 700, color: a.score > 0 ? 'var(--success)' : a.score < 0 ? 'var(--m-red)' : 'var(--on-dark)' }}>{a.score}</span>
                  <button className={`vote-btn down${myVotes.find(v => v.targetType === 'answer' && v.targetId === a._id)?.type === 'down' ? ' active' : ''}`} onClick={() => handleVote('answer', a._id, 'down')}>▼</button>
                  {a.isAccepted && <div style={{ color: 'var(--success)', fontSize: 20 }}>✓</div>}
                </div>
                <div style={{ flex: 1 }}>
                  {a.isAccepted && (
                    <div className="accepted-badge" style={{ marginBottom: 12 }}>✓ ACCEPTED ANSWER</div>
                  )}
                  <p style={{ color: 'var(--body)', fontWeight: 300, lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap' }}>{a.content}</p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                      {a.author?.name} · {timeAgo(a.createdAt)}
                    </span>
                    {user && (user.id === question.userId?.toString() || user.id === question.userId) && !a.isAccepted && (
                      <button className="btn-primary btn-sm" onClick={() => handleAccept(a._id)} style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>✓ ACCEPT</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer form */}
      {user ? (
        <div>
          <div className="m-stripe" style={{ width: 40, marginBottom: 24 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>YOUR ANSWER</h2>
          {error && <div style={{ background: 'rgba(226,39,24,0.1)', border: '1px solid var(--m-red)', padding: '12px 16px', color: 'var(--m-red)', fontSize: 14, marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleAnswer}>
            <textarea className="input" style={{ minHeight: 160 }} value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder="Write your answer here…" required />
            <button type="submit" className="btn-primary filled" disabled={submitting} style={{ marginTop: 16 }}>
              {submitting ? 'POSTING…' : 'POST ANSWER'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--body)', marginBottom: 16 }}>You must be logged in to answer.</p>
          <Link to="/login" className="btn-primary btn-sm filled">LOGIN TO ANSWER</Link>
        </div>
      )}
    </div>
  );
}
