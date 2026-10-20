import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, Flower2, Stethoscope, FileText, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import Loader from '../ui/Loader';
import PageHeader from '../ui/PageHeader';
import { Reveal, stagger, fadeUp } from '../ui/motion';
import { getLevel } from '../ui/levels';

const Suggestions = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('suggestionsDone') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const analysisRaw = localStorage.getItem('screeningAnalysis');
        if (!analysisRaw) {
          navigate('/ai-screening');
          return;
        }

        const parsedAnalysis = JSON.parse(analysisRaw);
        setAnalysisData(parsedAnalysis);

        if (Array.isArray(parsedAnalysis.suggestions) && parsedAnalysis.suggestions.length > 0) {
          setSuggestions(parsedAnalysis.suggestions);
          return;
        }

        const depressionLevel = parsedAnalysis?.depression_level || '';
        if (!depressionLevel) {
          setError('No depression level found. Please complete the screening first.');
          return;
        }

        const resp = await api.post('/api/screening/suggestions', {
          depression_level: depressionLevel,
          domain: localStorage.getItem('assignedDomain') || parsedAnalysis.domain || '',
          phqAnswers: JSON.parse(localStorage.getItem('latestPHQAnswers') || '[]')
        });

        const fetchedSuggestions = Array.isArray(resp.data?.suggestions) ? resp.data.suggestions : [];
        setSuggestions(fetchedSuggestions);
        localStorage.setItem('screeningAnalysis', JSON.stringify({ ...parsedAnalysis, suggestions: fetchedSuggestions }));
      } catch (e) {
        console.error('Failed to fetch suggestions', e);
        setError('Failed to load suggestions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [navigate]);

  const toggleDone = (s) => {
    const next = done.includes(s) ? done.filter((d) => d !== s) : [...done, s];
    setDone(next);
    try {
      localStorage.setItem('suggestionsDone', JSON.stringify(next));
    } catch {
      // storage unavailable - progress just won't persist
    }
  };

  if (loading) return <Loader messages={['Gathering your recommendations…', 'Personalising your plan…']} />;

  if (error) {
    return (
      <div className="page page-narrow">
        <div className="alert alert-error"><AlertCircle size={18} /> {error}</div>
        <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => navigate('/ai-screening')}>Back to screening</button>
      </div>
    );
  }

  const level = getLevel(analysisData?.depression_level);
  const completed = suggestions.filter((s) => done.includes(s)).length;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Your care plan"
        title="Small steps, real change"
        italic={[3]}
        subtitle="Recommendations from your screening. Mark each one as done once you have tried it."
      />

      <div className="plan-layout">
        <div>
          {suggestions.length > 0 ? (
            <motion.ul className="plan-list card" variants={stagger(0.07, 0.2)} initial="hidden" animate="show">
              {suggestions.map((suggestion, index) => {
                const isDone = done.includes(suggestion);
                return (
                  <motion.li key={index} variants={fadeUp}>
                    <button className={`plan-item ${isDone ? 'done' : ''}`} onClick={() => toggleDone(suggestion)} aria-pressed={isDone}>
                      <span className="plan-check">
                        {isDone && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                            <Check size={14} strokeWidth={3} />
                          </motion.span>
                        )}
                      </span>
                      <span className="plan-num">{String(index + 1).padStart(2, '0')}</span>
                      <span className="plan-text">{suggestion}</span>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : (
            <div className="card card-pad">
              <h3>No suggestions available</h3>
              <p className="muted" style={{ margin: '0.4rem 0 1.25rem' }}>We couldn't generate personalised suggestions this time.</p>
              <button className="btn btn-primary" onClick={() => navigate('/ai-screening')}>Retake screening</button>
            </div>
          )}
        </div>

        {analysisData && (
          <motion.aside className="card card-pad plan-summary" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <span className="stat-label">Plan progress</span>
            <p className="plan-progress-num">{completed}<span> of {suggestions.length} done</span></p>
            <div className="progress-track">
              <motion.div className="progress-fill" animate={{ width: `${suggestions.length ? (completed / suggestions.length) * 100 : 0}%` }} />
            </div>
            <div className="divider" style={{ margin: '1.5rem 0' }} />
            <dl className="summary-list">
              <div><dt>Assessment</dt><dd style={{ color: level.color }}>{level.title}</dd></div>
              <div><dt>Focus area</dt><dd>{analysisData.domain || localStorage.getItem('assignedDomain') || 'General'}</dd></div>
              <div><dt>PHQ-9 score</dt><dd>{analysisData.phq9_score} / 27</dd></div>
            </dl>
          </motion.aside>
        )}
      </div>

      <div className="section">
        <h2 className="section-title">Keep going</h2>
        <Reveal className="grid grid-3">
          {[
            { icon: Flower2, title: 'Gentle yoga', text: 'Short guided sessions to release tension.', path: '/yoga' },
            { icon: Stethoscope, title: 'Talk to an expert', text: 'Find a professional near you.', path: '/professionals' },
            { icon: FileText, title: 'Download your report', text: 'Share your assessment with a doctor.', path: '/prescription-download' }
          ].map(({ icon: Icon, title, text, path }) => (
            <div key={title} className="card card-pad card-hover" onClick={() => navigate(path)}>
              <div className="icon-tile"><Icon size={20} /></div>
              <h3 style={{ margin: '1rem 0 0.3rem' }}>{title}</h3>
              <p className="muted small">{text}</p>
              <span className="card-link">Open <ArrowRight size={15} /></span>
            </div>
          ))}
        </Reveal>
      </div>

      <p className="faint small" style={{ marginTop: '2.5rem', maxWidth: 720 }}>
        These suggestions are AI-generated and are not a substitute for professional medical advice. If you're having
        thoughts of self-harm, call Tele-MANAS on <b>14416</b> or emergency services on <b>112</b>.
      </p>
    </div>
  );
};

export default Suggestions;
