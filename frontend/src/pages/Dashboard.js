import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, MessageCircle, LineChart, FileText, Stethoscope, Flower2, BookOpen, ArrowRight, Check, AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import { CountUp, stagger, fadeUp, ease } from '../ui/motion';
import Loader from '../ui/Loader';
import BreathingWidget from '../ui/BreathingWidget';
import { getLevel } from '../ui/levels';
import './Dashboard.css';

const FEATURES = [
  { title: 'PHQ-9 check-in', description: 'The clinically validated 9-question depression screen.', icon: ClipboardList, path: '/phq-test' },
  { title: 'AI screening', description: 'A short conversation, assessed by our AI models.', icon: MessageCircle, path: '/ai-screening' },
  { title: 'Progress', description: 'See how your scores change over time.', icon: LineChart, path: '/progress' },
  { title: 'Care report', description: 'Your full assessment, ready to save as a PDF.', icon: FileText, path: '/prescription-download' },
  { title: 'Find an expert', description: 'Psychiatrists, psychologists and therapists near you.', icon: Stethoscope, path: '/professionals' },
  { title: 'Yoga', description: 'Gentle guided movement for body and mind.', icon: Flower2, path: '/yoga' },
  { title: 'Articles', description: 'Evidence-based reading on mood, sleep and stress.', icon: BookOpen, path: '/blogs' }
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [phqHistory, setPhqHistory] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    const load = async () => {
      try {
        const [dash, phq, scr] = await Promise.all([
          api.get('/api/users/dashboard'),
          api.get('/api/phq/history').catch(() => ({ data: [] })),
          api.get('/api/screening/history').catch(() => ({ data: [] }))
        ]);
        setUser(dash.data.user);
        setPhqHistory(Array.isArray(phq.data) ? phq.data : []);
        setScreenings(Array.isArray(scr.data) ? scr.data : []);
      } catch (err) {
        setError('We could not load your dashboard. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading) return <Loader message="Preparing your dashboard…" />;

  if (error) {
    return (
      <div className="page page-narrow">
        <div className="alert alert-error"><AlertCircle size={18} /> {error}</div>
        <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => window.location.reload()}>Try again</button>
      </div>
    );
  }

  const latestPhq = phqHistory[0];
  const latestScreening = screenings[0];
  const level = latestScreening ? getLevel(latestScreening.depression_level) : null;
  const hasPHQ = Boolean(localStorage.getItem('hasCompletedPHQ')) || phqHistory.length > 0;
  const hasScreening = Boolean(localStorage.getItem('screeningAnalysis')) || screenings.length > 0;

  const journey = [
    { label: 'PHQ-9 check-in', done: hasPHQ, path: '/phq-test' },
    { label: 'AI screening', done: hasScreening, path: hasPHQ ? '/ai-screening' : '/phq-test' },
    { label: 'Review your results', done: hasScreening, path: '/screening-result' },
    { label: 'Follow your care plan', done: hasScreening, path: '/suggestions' }
  ];
  const nextStep = journey.find((j) => !j.done);
  const doneCount = journey.filter((j) => j.done).length;

  return (
    <div className="page">
      <motion.section className="dash-hero" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
        <div>
          <span className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <h1 className="dash-title">{greeting()}, <em className="serif-em">{user?.username || 'friend'}</em></h1>
          <p className="muted">How are you feeling today? Every check-in helps you understand yourself a little better.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(nextStep ? nextStep.path : '/phq-test')}>
          {nextStep ? `Continue: ${nextStep.label}` : 'Start a new check-in'} <ArrowRight size={17} className="arrow" />
        </button>
      </motion.section>

      <motion.section className="card stat-panel" variants={stagger(0.08, 0.15)} initial="hidden" animate="show">
        <motion.div variants={fadeUp} className="stat-cell">
          <span className="stat-label">Check-ins taken</span>
          <span className="stat-num"><CountUp to={phqHistory.length} /></span>
        </motion.div>
        <motion.div variants={fadeUp} className="stat-cell">
          <span className="stat-label">AI screenings</span>
          <span className="stat-num"><CountUp to={screenings.length} /></span>
        </motion.div>
        <motion.div variants={fadeUp} className="stat-cell">
          <span className="stat-label">Latest PHQ-9</span>
          <span className="stat-num">{latestPhq ? <><CountUp to={latestPhq.score} /><small> / 27</small></> : '—'}</span>
          <span className="faint small">{latestPhq ? latestPhq.severity : 'No check-in yet'}</span>
        </motion.div>
        <motion.div variants={fadeUp} className="stat-cell">
          <span className="stat-label">Latest assessment</span>
          {level ? (
            <span className="level-pill" style={{ color: level.color, background: level.bg }}>{level.title}</span>
          ) : <span className="stat-num">—</span>}
          <span className="faint small">{latestScreening ? new Date(latestScreening.createdAt).toLocaleDateString() : 'Complete an AI screening'}</span>
        </motion.div>
      </motion.section>

      <section className="dash-split section">
        <motion.div className="card card-pad" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease }}>
          <div className="journey-head">
            <h3>Your journey</h3>
            <span className="faint small">{doneCount} of {journey.length} complete</span>
          </div>
          <div className="progress-track" style={{ margin: '1rem 0 1.25rem' }}>
            <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${(doneCount / journey.length) * 100}%` }} transition={{ duration: 1, delay: 0.5, ease }} />
          </div>
          <ol className="journey-list">
            {journey.map((j, i) => {
              const clickable = j.done || nextStep === j;
              return (
                <li
                  key={j.label}
                  className={`${j.done ? 'done' : ''} ${nextStep === j ? 'next' : ''} ${clickable ? 'clickable' : ''}`}
                  onClick={() => clickable && navigate(j.path)}
                >
                  <span className="journey-dot">{j.done ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
                  <span>{j.label}</span>
                  {nextStep === j && <span className="journey-next">Up next <ArrowRight size={14} /></span>}
                </li>
              );
            })}
          </ol>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6, ease }}>
          <BreathingWidget />
        </motion.div>
      </section>

      <section className="section">
        <h2 className="section-title">Explore</h2>
        <motion.div className="grid grid-3" variants={stagger(0.05)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {FEATURES.map(({ title, description, icon: Icon, path }) => (
            <motion.div key={title} variants={fadeUp} className="card card-pad card-hover" onClick={() => navigate(path)}>
              <div className="icon-tile"><Icon size={21} strokeWidth={1.8} /></div>
              <h3 style={{ margin: '1.1rem 0 0.35rem' }}>{title}</h3>
              <p className="muted small">{description}</p>
              <span className="card-link">Open <ArrowRight size={15} /></span>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default Dashboard;
