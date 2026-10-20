// frontend/src/components/ProgressTracker.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { AlertCircle, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import Loader from '../ui/Loader';
import PageHeader from '../ui/PageHeader';
import { CountUp, Reveal, stagger, fadeUp } from '../ui/motion';
import { getLevel } from '../ui/levels';
import '../pages/Dashboard.css';

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="card" style={{ padding: '0.65rem 0.85rem', fontSize: '0.85rem', boxShadow: 'var(--shadow)' }}>
      <b>{p.date}</b>
      <div>PHQ-9: {p.score} / 27</div>
      <div className="faint">{p.severity}</div>
    </div>
  );
};

const ProgressTracker = () => {
  const navigate = useNavigate();
  const [phq, setPhq] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    const load = async () => {
      try {
        const [p, s] = await Promise.all([api.get('/api/phq/history'), api.get('/api/screening/history')]);
        setPhq(Array.isArray(p.data) ? p.data : []);
        setScreenings(Array.isArray(s.data) ? s.data : []);
      } catch (err) {
        console.error(err);
        setError('Could not load your progress right now.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading) return <Loader message="Loading your progress…" />;

  const chartData = [...phq].reverse().map((t) => ({
    date: new Date(t.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
    score: t.score,
    severity: t.severity
  }));
  const first = chartData[0]?.score;
  const last = chartData[chartData.length - 1]?.score;
  const change = chartData.length > 1 ? last - first : null;
  const best = chartData.length ? Math.min(...chartData.map((d) => d.score)) : null;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Your progress"
        title="Every step counts"
        italic={[2]}
        subtitle="Lower PHQ-9 scores mean fewer symptoms. Track how things change across your check-ins."
      />

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}><AlertCircle size={18} /> {error}</div>}

      {phq.length === 0 ? (
        <div className="card card-pad">
          <h3>No check-ins yet</h3>
          <p className="muted" style={{ margin: '0.4rem 0 1.25rem' }}>Take your first PHQ-9 check-in to start tracking your progress.</p>
          <button className="btn btn-primary" onClick={() => navigate('/phq-test')}>Start check-in <ArrowRight size={17} className="arrow" /></button>
        </div>
      ) : (
        <>
          <motion.section className="card stat-panel" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }} variants={stagger(0.08, 0.15)} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="stat-cell">
              <span className="stat-label">Latest score</span>
              <span className="stat-num"><CountUp to={last} /><small> / 27</small></span>
            </motion.div>
            <motion.div variants={fadeUp} className="stat-cell">
              <span className="stat-label">Change since first</span>
              <span className="stat-num" style={{ color: change === null ? undefined : change <= 0 ? 'var(--level-none)' : 'var(--level-severe)' }}>
                {change === null ? '—' : `${change > 0 ? '+' : ''}${change}`}
              </span>
              <span className="faint small" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {change === null ? 'Needs two or more check-ins' : change <= 0
                  ? <><TrendingDown size={14} /> Improving</>
                  : <><TrendingUp size={14} /> Worth some extra care</>}
              </span>
            </motion.div>
            <motion.div variants={fadeUp} className="stat-cell">
              <span className="stat-label">Best score</span>
              <span className="stat-num"><CountUp to={best} /><small> / 27</small></span>
            </motion.div>
          </motion.section>

          <Reveal className="section">
            <h2 className="section-title">PHQ-9 over time</h2>
            <div className="card chart-card">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="phqFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1f5e4a" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#1f5e4a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e3e0d7" vertical={false} />
                  <XAxis dataKey="date" stroke="#6b716c" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis domain={[0, 27]} stroke="#6b716c" tickLine={false} axisLine={false} fontSize={12} width={36} />
                  <ReferenceLine y={10} stroke="#b0440a" strokeDasharray="4 4" label={{ value: 'Moderate threshold', fill: '#b0440a', fontSize: 11, position: 'insideTopRight' }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c9c5b9' }} />
                  <Area type="monotone" dataKey="score" stroke="#1f5e4a" strokeWidth={2.5} fill="url(#phqFill)"
                    dot={{ r: 4, fill: '#fff', stroke: '#1f5e4a', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#1f5e4a' }}
                    animationDuration={1400} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Reveal>
        </>
      )}

      {screenings.length > 0 && (
        <div className="section">
          <h2 className="section-title">AI screening history</h2>
          <motion.ul className="card timeline" variants={stagger(0.06)} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {screenings.map((s) => {
              const level = getLevel(s.depression_level);
              return (
                <motion.li key={s._id} variants={fadeUp}>
                  <span className="when">{new Date(s.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="level-tag" style={{ color: level.color, background: level.bg }}>{level.title}</span>
                  <span className="muted small" style={{ marginLeft: 'auto' }}>Focus: {s.domain}</span>
                  <span className="badge">PHQ-9 {s.phqScore}</span>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
